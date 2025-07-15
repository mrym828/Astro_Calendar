# simplified_constellation_tracker.py
# A more robust version that handles edge cases better

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from astronomy import Time, Body, Constellation, ConstellationInfo, GeoVector, EquatorFromVector
import traceback

from ...models import CelestialEvent, PlanetaryEvent, ApiSource, Location


class Command(BaseCommand):
    help = 'Track constellation changes for celestial bodies with better error handling'

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=30, help='Number of days to track')
        parser.add_argument('--location', type=str, help='Location name to associate with events')
        parser.add_argument('--bodies', type=str, nargs='+', 
                          default=['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'],
                          help='Celestial bodies to track')
        parser.add_argument('--start-date', type=str, help='Start date in YYYY-MM-DD format')
        parser.add_argument('--increment', type=float, default=0.1, help='Day increment for tracking')
        parser.add_argument('--verbose', action='store_true', help='Enable verbose output')
        parser.add_argument('--skip-errors', action='store_true', help='Skip bodies with errors')

    def handle(self, *args, **options):
        try:
            self.setup_tracking(options)
        except Exception as e:
            if options.get('verbose'):
                self.stdout.write(traceback.format_exc())
            raise CommandError(f'Error in constellation tracking: {str(e)}')

    def setup_tracking(self, options):
        # Get configuration
        days = options['days']
        location_name = options['location']
        body_names = options['bodies']
        start_date = options['start_date']
        increment = options['increment']
        verbose = options['verbose']
        skip_errors = options['skip_errors']

        self.stdout.write(self.style.SUCCESS('Starting constellation tracking...'))

        # Setup API source
        api_source, _ = ApiSource.objects.get_or_create(
            name="Astronomy Library",
            defaults={'base_url': 'https://github.com/cosinekitty/astronomy'}
        )

        # Setup location
        location = None
        if location_name:
            try:
                location = Location.objects.get(name=location_name)
            except Location.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'Location "{location_name}" not found'))

        # Parse start date
        if start_date:
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                # Convert to Julian days (astronomy library format)
                start_time = Time(start_dt.timestamp() / 86400.0 - 10957.5)
            except ValueError:
                raise CommandError(f'Invalid date format: {start_date}. Use YYYY-MM-DD')
        else:
            start_time = Time.Now()

        stop_time = start_time.AddDays(days)

        # Map body names to objects
        body_map = {
            'Sun': Body.Sun, 'Moon': Body.Moon, 'Mercury': Body.Mercury, 'Venus': Body.Venus,
            'Mars': Body.Mars, 'Jupiter': Body.Jupiter, 'Saturn': Body.Saturn,
            'Uranus': Body.Uranus, 'Neptune': Body.Neptune
        }

        # Process each body
        total_events = 0
        for body_name in body_names:
            if body_name not in body_map:
                self.stdout.write(self.style.WARNING(f'Unknown body: {body_name}. Skipping.'))
                continue

            body = body_map[body_name]
            self.stdout.write(f'Tracking {body_name}...')

            try:
                events = self.track_body_safely(
                    body, start_time, stop_time, increment, api_source, location, verbose
                )
                total_events += len(events)
                self.stdout.write(f'  Created {len(events)} events for {body_name}')
            
            except Exception as e:
                error_msg = f'Error tracking {body_name}: {str(e)}'
                if skip_errors:
                    self.stdout.write(self.style.WARNING(error_msg + ' (skipping)'))
                    if verbose:
                        self.stdout.write(traceback.format_exc())
                    continue
                else:
                    self.stdout.write(self.style.ERROR(error_msg))
                    if verbose:
                        self.stdout.write(traceback.format_exc())
                    raise CommandError(error_msg)

        self.stdout.write(self.style.SUCCESS(f'Successfully created {total_events} events'))

    def safe_constellation(self, body: Body, time: Time) -> Optional[ConstellationInfo]:
        """Safely get constellation, returning None if there's an error"""
        try:
            vec = GeoVector(body, time, False)
            if vec is None:
                return None
            equ = EquatorFromVector(vec)
            if equ is None:
                return None
            return Constellation(equ.ra, equ.dec)
        except Exception:
            return None

    def track_body_safely(self, body: Body, start_time: Time, stop_time: Time, 
                         increment: float, api_source: ApiSource, 
                         location: Optional[Location], verbose: bool) -> List[CelestialEvent]:
        """Track constellation changes with error handling"""
        
        events = []
        t1 = start_time
        
        # Get initial constellation
        c1 = self.safe_constellation(body, t1)
        if c1 is None:
            if verbose:
                self.stdout.write(f'  Cannot determine initial constellation for {body.name}')
            return events
        
        if verbose:
            self.stdout.write(f'  Initial constellation: {c1.name}')
        
        error_count = 0
        max_errors = 10  # Skip body if too many errors
        
        while t1 < stop_time:
            try:
                t2 = t1.AddDays(increment)
                c2 = self.safe_constellation(body, t2)
                
                if c2 is None:
                    error_count += 1
                    if error_count > max_errors:
                        self.stdout.write(self.style.WARNING(f'Too many errors for {body.name}, stopping'))
                        break
                    t1 = t2
                    continue
                
                # Check for constellation change
                if c1.symbol != c2.symbol:
                    # Find precise transition time
                    tx, cx = self.find_transition_safely(body, c1, t1, t2)
                    
                    if tx is not None and cx is not None:
                        event = self.create_event_safely(
                            body, tx, c1, cx, api_source, location, verbose
                        )
                        if event:
                            events.append(event)
                            if verbose:
                                self.stdout.write(f'  Created: {event.name}')
                        c1 = cx
                        t1 = tx
                    else:
                        # Couldn't find precise transition, use approximate
                        c1 = c2
                        t1 = t2
                else:
                    c1 = c2
                    t1 = t2
                    
            except Exception as e:
                error_count += 1
                if verbose:
                    self.stdout.write(f'  Error at {t1}: {str(e)}')
                if error_count > max_errors:
                    self.stdout.write(self.style.WARNING(f'Too many errors for {body.name}, stopping'))
                    break
                t1 = t1.AddDays(increment)
                continue
        
        return events

    def find_transition_safely(self, body: Body, c1: ConstellationInfo, 
                              t1: Time, t2: Time) -> Tuple[Optional[Time], Optional[ConstellationInfo]]:
        """Safely find constellation transition time"""
        try:
            tolerance = 0.1 / (24.0 * 3600.0)  # 0.1 seconds
            max_iterations = 50
            iterations = 0
            
            while iterations < max_iterations:
                iterations += 1
                dt = t2.ut - t1.ut
                if dt < tolerance:
                    break
                    
                tx = t1.AddDays(dt/2)
                cx = self.safe_constellation(body, tx)
                
                if cx is None:
                    # If we can't determine constellation at midpoint, use t2
                    return t2, self.safe_constellation(body, t2)
                
                if cx.symbol == c1.symbol:
                    t1 = tx
                else:
                    t2 = tx
                    
            # Return the final position
            final_constellation = self.safe_constellation(body, t2)
            return t2, final_constellation
            
        except Exception:
            return None, None

    def create_event_safely(self, body: Body, time: Time, old_const: ConstellationInfo, 
                           new_const: ConstellationInfo, api_source: ApiSource, 
                           location: Optional[Location], verbose: bool) -> Optional[CelestialEvent]:
        """Safely create a CelestialEvent"""
        try:
            # Convert time to datetime
            timestamp = time.ut * 86400.0 + 946684800.0
            dt = datetime.fromtimestamp(timestamp)
            dt = timezone.make_aware(dt)
            
            # Create external ID
            external_id = f"constellation_{body.name}_{time.ut:.6f}"
            
            # Check if already exists
            if CelestialEvent.objects.filter(external_id=external_id).exists():
                if verbose:
                    self.stdout.write(f'  Event {external_id} already exists')
                return None
            
            # Get coordinates
            coordinates = {'constellation_symbol': new_const.symbol}
            try:
                vec = GeoVector(body, time, False)
                equ = EquatorFromVector(vec)
                coordinates.update({
                    'right_ascension': equ.ra,
                    'declination': equ.dec
                })
            except Exception:
                pass  # Use basic coordinates
            
            # Create event
            event = CelestialEvent.objects.create(
                name=f"{body.name} enters {new_const.name}",
                event_type='planetary_event' if body.name in ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'] else 'conjunction',
                date_time=dt,
                description=f"{body.name} leaves {old_const.name} and enters {new_const.name}",
                external_id=external_id,
                raw_api_data={
                    'body': body.name,
                    'transition_time_ut': time.ut,
                    'old_constellation': {'symbol': old_const.symbol, 'name': old_const.name},
                    'new_constellation': {'symbol': new_const.symbol, 'name': new_const.name}
                },
                api_source=api_source,
                location=location,
                coordinates=coordinates,
                importance_level=2,
                viewing_difficulty='easy'
            )
            
            # Create PlanetaryEvent if needed
            if body.name in ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']:
                try:
                    PlanetaryEvent.objects.create(
                        celestialevent_ptr=event,
                        planet_name=body.name,
                        constellation=new_const.name,
                        apparent_magnitude=0.0,
                        right_ascension=coordinates.get('right_ascension', 0.0),
                        declination=coordinates.get('declination', 0.0)
                    )
                except Exception as e:
                    if verbose:
                        self.stdout.write(f'  Warning: Could not create PlanetaryEvent: {e}')
            
            return event
            
        except Exception as e:
            if verbose:
                self.stdout.write(f'  Error creating event: {e}')
            return None