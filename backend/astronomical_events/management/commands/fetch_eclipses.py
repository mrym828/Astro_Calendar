import requests
from requests.auth import HTTPBasicAuth
from django.core.management.base import BaseCommand
from datetime import datetime
from ...models import ApiSource, Eclipse, Location
from django.utils.timezone import make_aware
from django.conf import settings
import uuid
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Fetch eclipse events and store them in the database"

    def add_arguments(self, parser):
        parser.add_argument('--latitude', type=float, default=25.276987)
        parser.add_argument('--longitude', type=float, default=55.296249)
        parser.add_argument('--elevation', type=int, default=10)
        parser.add_argument('--from_date', type=str, default='2025-01-01')
        parser.add_argument('--to_date', type=str, default='2025-12-31')
        parser.add_argument('--debug', action='store_true', help='Enable debug output')

    def handle(self, *args, **options):
        # Use environment variables or settings for credentials
        APP_ID = getattr(settings, 'ASTRONOMY_API_ID', None)
        APP_SECRET = getattr(settings, 'ASTRONOMY_API_SECRET', None)
        
        if not APP_ID or not APP_SECRET:
            self.stderr.write("Missing API credentials. Set ASTRONOMY_API_ID and ASTRONOMY_API_SECRET in settings.")
            return
        
        body = "moon"
        url = f"https://api.astronomyapi.com/api/v2/bodies/events/{body}"
        auth = HTTPBasicAuth(APP_ID, APP_SECRET)
        params = {
            "latitude": str(options["latitude"]),
            "longitude": str(options["longitude"]),
            "elevation": str(options["elevation"]),
            "from_date": options["from_date"],
            "to_date": options["to_date"],
            "time": "12:00:00",
            "output": "rows"
        }

        try:
            self.stdout.write(f"Making API request to: {url}")
            res = requests.get(url, params=params, auth=auth, timeout=30)
            
            if res.status_code != 200:
                self.stderr.write(f"API request failed: {res.status_code}")
                self.stderr.write(f"Response: {res.text}")
                return

            response_data = res.json()
            
            if options['debug']:
                self.stdout.write(f"Full API response: {response_data}")

            if 'data' not in response_data:
                self.stderr.write("API response missing 'data' field")
                self.stderr.write(f"Response keys: {list(response_data.keys())}")
                return

            rows = response_data.get('data', {}).get('rows', [])
            self.stdout.write(f"Found {len(rows)} rows of data")

            if not rows:
                self.stdout.write("No eclipse data found for the specified parameters")
                return

            api_source, _ = ApiSource.objects.get_or_create(
                name="AstronomyAPI", 
                defaults={"base_url": "https://api.astronomyapi.com"}
            )

            created_count = 0
            updated_count = 0

            for i, row in enumerate(rows):
                if options['debug']:
                    self.stdout.write(f"Processing row {i+1}: {row}")

                body_name = row.get('body', {}).get('name', 'moon')
                events = row.get('events', [])
                
                if not events:
                    self.stdout.write(f"No events found in row {i+1}")
                    continue

                for event in events:
                    try:
                        event_type = event.get('type', 'unknown')
                        obscuration = event.get('extraInfo', {}).get('obscuration', 0.0)
                        highlights = event.get('eventHighlights', {})
                        peak = highlights.get('peak', {}).get('date')
                        peak_altitude = highlights.get('peak', {}).get('altitude')

                        partial_begin_altitude = highlights.get('partialStart', {}).get('altitude')
                        total_begin_altitude = highlights.get('fullStart', {}).get('altitude')
                        total_end_altitude = highlights.get('fullEnd', {}).get('altitude')
                        partial_end_altitude = highlights.get('partialEnd', {}).get('altitude')

                        duration_seconds = None
                        penumbral_start = highlights.get('penumbralStart', {}).get('date')
                        penumbral_end = highlights.get('penumbralEnd', {}).get('date')
                        
                        if penumbral_start and penumbral_end:
                            try:
                                start_time = datetime.fromisoformat(penumbral_start)
                                end_time = datetime.fromisoformat(penumbral_end)
                                duration_seconds = int((end_time - start_time).total_seconds())
                            except (ValueError, TypeError):
                                pass

                        if peak:
                            external_id = f"{event_type}_{peak.split('T')[0]}_{options['latitude']}_{options['longitude']}"
                        else:
                            self.stdout.write(f"Skipping event without peak date: {event}")
                            continue

                        if not peak:
                            self.stdout.write(f"Skipping event without peak date: {event}")
                            continue

                        try:
                            peak_time = datetime.fromisoformat(peak)
                            if peak_time.tzinfo is None:
                                peak_time = make_aware(peak_time)
                        except (ValueError, TypeError) as e:
                            self.stderr.write(f"Date parsing error for {peak}: {e}")
                            continue

                        eclipse_type_map = {
                            "penumbral_lunar_eclipse": "lunar_penumbral",
                            "partial_lunar_eclipse": "lunar_partial", 
                            "total_lunar_eclipse": "lunar_total"
                        }
                        eclipse_type = eclipse_type_map.get(event_type.lower(), "lunar_partial")

                        eclipse_type_display = event_type.replace('_', ' ').title()
                        eclipse_name = f"{body_name} {eclipse_type_display}"

                        totality_duration_seconds = None
                        if eclipse_type == "lunar_total":
                            full_start = highlights.get('fullStart', {}).get('date')
                            full_end = highlights.get('fullEnd', {}).get('date')
                            
                            if full_start and full_end:
                                try:
                                    start_time = datetime.fromisoformat(full_start)
                                    end_time = datetime.fromisoformat(full_end)
                                    totality_duration_seconds = int((end_time - start_time).total_seconds())
                                    
                                    if options['debug']:
                                        self.stdout.write(f"Totality duration: {full_start} to {full_end} = {totality_duration_seconds} seconds")
                                except (ValueError, TypeError) as e:
                                    if options['debug']:
                                        self.stdout.write(f"Totality duration calculation failed: {e}")
                                    pass

                        description_parts = [f"{eclipse_type_display} with {obscuration*100:.1f}% obscuration"]
                        if peak_altitude:
                            description_parts.append(f"Peak altitude: {peak_altitude:.1f}°")
                        if duration_seconds:
                            hours = duration_seconds // 3600
                            minutes = (duration_seconds % 3600) // 60
                            if hours > 0:
                                description_parts.append(f"Duration: {hours}h {minutes}m")
                            else:
                                description_parts.append(f"Duration: {minutes}m")
                        
                        description = ". ".join(description_parts) + "."

                        overview_parts = []
                        
                        # Add eclipse type explanation
                        if eclipse_type == "lunar_total":
                            overview_parts.append("A total lunar eclipse occurs when the Moon passes completely through Earth's shadow, causing it to take on a reddish color often called a 'Blood Moon'.")
                        elif eclipse_type == "lunar_partial":
                            overview_parts.append("A partial lunar eclipse occurs when only part of the Moon passes through Earth's shadow, creating a partial darkening effect.")
                        else:
                            overview_parts.append("A penumbral lunar eclipse occurs when the Moon passes through Earth's penumbral shadow, causing a subtle darkening that may be difficult to notice.")
                        
                        if penumbral_start and penumbral_end:
                            try:
                                start_dt = datetime.fromisoformat(penumbral_start)
                                end_dt = datetime.fromisoformat(penumbral_end)
                                overview_parts.append(f"The eclipse begins at {start_dt.strftime('%H:%M')} local time and ends at {end_dt.strftime('%H:%M')} local time.")
                            except (ValueError, TypeError):
                                pass
                        
                        if eclipse_type == "lunar_total" and highlights.get('partialStart') and highlights.get('fullStart'):
                            try:
                                partial_start_dt = datetime.fromisoformat(highlights['partialStart']['date'])
                                full_start_dt = datetime.fromisoformat(highlights['fullStart']['date'])
                                full_end_dt = datetime.fromisoformat(highlights['fullEnd']['date'])
                                partial_end_dt = datetime.fromisoformat(highlights['partialEnd']['date'])
                                
                                overview_parts.append(f"The partial eclipse phase begins at {partial_start_dt.strftime('%H:%M')}, totality starts at {full_start_dt.strftime('%H:%M')}, reaches maximum at {peak_time.strftime('%H:%M')}, totality ends at {full_end_dt.strftime('%H:%M')}, and the partial phase ends at {partial_end_dt.strftime('%H:%M')}.")
                            except (ValueError, TypeError, KeyError):
                                pass

                        if peak_altitude:
                            if peak_altitude > 60:
                                altitude_desc = "high in the sky"
                            elif peak_altitude > 30:
                                altitude_desc = "well above the horizon"
                            elif peak_altitude > 15:
                                altitude_desc = "moderately high"
                            else:
                                altitude_desc = "low on the horizon"
                            
                            overview_parts.append(f"At peak eclipse, the Moon will be {altitude_desc} at {peak_altitude:.1f}° altitude.")
                        
                        overview_parts.append("This eclipse will be visible from your location, weather permitting.")

                        if eclipse_type == "lunar_total":
                            overview_parts.append("Total lunar eclipses are safe to observe with the naked eye and are spectacular through binoculars or telescopes.")
                        elif eclipse_type == "lunar_partial":
                            overview_parts.append("Partial lunar eclipses are easily visible to the naked eye and make for excellent photography opportunities.")
                        else:
                            overview_parts.append("Penumbral eclipses are subtle and may require careful observation to notice the dimming effect.")

                        overview = " ".join(overview_parts)

                        eclipse_data = {
                            "name": f"{body_name.title()} {event_type.title()} Eclipse",
                            "event_type": "eclipse",
                            "date_time": peak_time,
                            "description": overview,
                            "raw_api_data": event,
                            "api_source": api_source,
                            "eclipse_type": eclipse_type,
                            "obscuration_percentage": obscuration * 100,
                            "coordinates": {
                                "latitude": options["latitude"],
                                "longitude": options["longitude"]
                            },
                            "visibility_regions": ["Local"],
                            "importance_level": 2,
                            "partial_begin_altitude" : partial_begin_altitude,
                            "total_begin_altitude": total_begin_altitude,
                            "peak_altitude":peak_altitude,
                            "total_end_altitude":total_end_altitude,
                            "partial_end_altitude":partial_end_altitude,
                            "duration_seconds": totality_duration_seconds,
                        }
                        

                        eclipse, created = Eclipse.objects.update_or_create(
                            external_id=external_id,
                            defaults=eclipse_data
                        )

                        if created:
                            created_count += 1
                            self.stdout.write(f"Created eclipse: {eclipse.name}")
                        else:
                            updated_count += 1
                            self.stdout.write(f"Updated eclipse: {eclipse.name}")

                    except Exception as e:
                        self.stderr.write(f"Error processing event: {e}")
                        if options['debug']:
                            import traceback
                            traceback.print_exc()
                        continue

            self.stdout.write(
                self.style.SUCCESS(
                    f"Eclipse events processed successfully! Created: {created_count}, Updated: {updated_count}"
                )
            )

        except requests.exceptions.RequestException as e:
            self.stderr.write(f"Network error: {e}")
        except Exception as e:
            self.stderr.write(f"Unexpected error: {e}")
            if options['debug']:
                import traceback
                traceback.print_exc()