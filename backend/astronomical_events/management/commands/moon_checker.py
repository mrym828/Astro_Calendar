from django.core.management.base import BaseCommand, CommandError
from astronomical_events.models import CelestialEvent, Location, ApiSource
from datetime import datetime, timedelta, timezone
from skyfield.api import load
from skyfield.searchlib import find_maxima, find_minima
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Fetches Moon apogee and perigee events for a given year and saves them as CelestialEvents.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--year',
            type=int,
            default=datetime.now().year,
            help='The year for which to fetch Moon apogee/perigee events.'
        )
        parser.add_argument(
            '--location',
            type=str,
            default='Sharjah', # Default location for associating events
            help='Name of the location to associate with these events. Defaults to "Sharjah".'
        )

    def get_moon_distance_function(self, ephemeris):
        """
        Returns a function that calculates the Earth-Moon distance in kilometers
        for a given Skyfield Time object.
        """
        earth = ephemeris['earth']
        moon = ephemeris['moon']

        def distance_km(t):
            """Calculates the distance between Earth and Moon at time t."""
            return earth.at(t).observe(moon).distance().km

        distance_km.step_days = 1 # A reasonable step for finding lunar extrema
        return distance_km

    def handle(self, *args, **options):
        year = options['year']
        location_name = options['location']

        try:
            location = Location.objects.get(name=location_name)
        except Location.DoesNotExist:
            raise CommandError(f"Location '{location_name}' not found. Please create it first.")

        api_source, _ = ApiSource.objects.get_or_create(
            name="Skyfield",
            defaults={"base_url": "https://rhodesmill.org/skyfield/"}
         )

        self.stdout.write(f"Fetching Moon apogee/perigee events for {year}...")

        ts = load.timescale()
        try:
            self.stdout.write("Loading Skyfield ephemeris data (this may take a moment)...")
            eph = load('de421.bsp') # Load a planetary ephemeris
            self.stdout.write("Ephemeris loaded.")
        except Exception as e:
            raise CommandError(f"Failed to load Skyfield ephemeris: {e}. "
                               f"Ensure 'de421.bsp' is downloaded. "
                               f"You can download it by running `from skyfield.api import load; load('de421.bsp')` in a Python shell.")

        # Define the search period for the entire year
        t_start = ts.utc(year, 1, 1)
        t_end = ts.utc(year + 1, 1, 1) # Up to the start of the next year

        moon_distance_func = self.get_moon_distance_function(eph)

        # Find apogees (maxima) and perigees (minima) for the year
        apogee_times, apogee_distances = find_maxima(t_start, t_end, moon_distance_func)
        perigee_times, perigee_distances = find_minima(t_start, t_end, moon_distance_func)

        created_count = 0
        updated_count = 0

        # Process Apogee events
        for t, d in zip(apogee_times, apogee_distances):
            event_dt = t.utc_datetime().astimezone(timezone.utc) # Ensure timezone-aware UTC
            
            name = "Moon Apogee"
            description = f"The Moon reaches its apogee (farthest point from Earth) at a distance of {d:.2f} km."
            external_id = f"moon_apogee_{event_dt.strftime('%Y%m%d%H%M%S')}"

            obj, created = CelestialEvent.objects.update_or_create(
                external_id=external_id,
                defaults={
                    'name': name,
                    'event_type': 'moon_apogee',
                    'date_time': event_dt,
                    'description': description,
                    'raw_api_data': {'distance_km': d},
                    'last_updated_from_api': datetime.now(timezone.utc),
                    'api_source': api_source,
                    'location': location, # Associate with a default location
                    'importance_level': 2,
                    'viewing_difficulty': 'easy', # Apogee/Perigee are orbital points, not visual events
                    'slug': slugify(f"{name}-{event_dt.strftime('%Y-%m-%d')}")
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created: {name} on {event_dt.date()} at {event_dt.time()}"))
            else:
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f"Updated: {name} on {event_dt.date()} at {event_dt.time()}"))

        # Process Perigee events
        for t, d in zip(perigee_times, perigee_distances):
            event_dt = t.utc_datetime().astimezone(timezone.utc) # Ensure timezone-aware UTC

            name = "Moon Perigee"
            description = f"The Moon reaches its perigee (closest point to Earth) at a distance of {d:.2f} km."
            external_id = f"moon_perigee_{event_dt.strftime('%Y%m%d%H%M%S')}"

            obj, created = CelestialEvent.objects.update_or_create(
                external_id=external_id,
                defaults={
                    'name': name,
                    'event_type': 'moon_perigee',
                    'date_time': event_dt,
                    'description': description,
                    'raw_api_data': {'distance_km': d},
                    'last_updated_from_api': datetime.now(timezone.utc),
                    'api_source': api_source,
                    'location': location, # Associate with a default location
                    'importance_level': 2,
                    'viewing_difficulty': 'easy',
                    'slug': slugify(f"{name}-{event_dt.strftime('%Y-%m-%d')}")
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created: {name} on {event_dt.date()} at {event_dt.time()}"))
            else:
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f"Updated: {name} on {event_dt.date()} at {event_dt.time()}"))

        self.stdout.write(self.style.SUCCESS(
            f"\nFinished fetching Moon apogee/perigee events for {year}. "
            f"Created: {created_count}, Updated: {updated_count}"
        ))

