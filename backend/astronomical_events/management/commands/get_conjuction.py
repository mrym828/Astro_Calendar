from django.core.management.base import BaseCommand, CommandError
from datetime import datetime, timedelta
from skyfield.api import load, Topos
from math import degrees

class Command(BaseCommand):
    help = 'Find planetary conjunctions in given date range for given planet pairs'

    def add_arguments(self, parser):
        parser.add_argument('--start-date', required=True, type=str, help='Start date YYYY-MM-DD')
        parser.add_argument('--end-date', required=True, type=str, help='End date YYYY-MM-DD')
        parser.add_argument('--pairs', nargs='+', required=True, help='Planet pairs like Venus-Uranus Mars-Jupiter')
        parser.add_argument('--step-minutes', type=int, default=60, help='Step size in minutes for searching conjunction')

    def handle(self, *args, **options):
        start_date = options['start_date']
        end_date = options['end_date']
        pairs = options['pairs']
        step_minutes = options['step_minutes']

        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        except ValueError as e:
            raise CommandError(f'Invalid date format: {e}')

        self.stdout.write(f'Checking conjunctions from {start_dt} to {end_dt}')
        self.stdout.write(f'Planet pairs: {pairs}')

        eph = load('de440s.bsp')
        ts = load.timescale()

        earth = eph['earth']

        for pair in pairs:
            planets = pair.split('-')
            if len(planets) != 2:
                self.stdout.write(self.style.ERROR(f'Invalid pair format: {pair}'))
                continue

            planet1_name, planet2_name = planets[0].lower(), planets[1].lower()
            if planet1_name not in eph or planet2_name not in eph:
                self.stdout.write(self.style.ERROR(f'Unknown planet(s) in pair: {pair}'))
                continue

            planet1 = eph[planet1_name]
            planet2 = eph[planet2_name]

            self.stdout.write(f'Finding conjunctions between {planet1_name.capitalize()} and {planet2_name.capitalize()}')

            current_dt = start_dt
            last_sep = None
            conjunctions = []

            while current_dt <= end_dt:
                t = ts.utc(current_dt.year, current_dt.month, current_dt.day, current_dt.hour, current_dt.minute)
                astrometric1 = earth.at(t).observe(planet1)
                astrometric2 = earth.at(t).observe(planet2)

                ra1, dec1, dist1 = astrometric1.radec()
                ra2, dec2, dist2 = astrometric2.radec()

                # Calculate angular separation in degrees
                separation = degrees(astrometric1.separation_from(astrometric2).radians)

                # Detect local minima in separation as conjunction candidates
                if last_sep is not None and last_sep < separation:
                    # Previous step was a minimum separation
                    conjunction_time = current_dt - timedelta(minutes=step_minutes)
                    conjunctions.append((conjunction_time, last_sep))
                last_sep = separation
                current_dt += timedelta(minutes=step_minutes)

            if conjunctions:
                self.stdout.write(f'Conjunctions for {pair}:')
                for dtc, sep in conjunctions:
                    self.stdout.write(f'  {dtc} separation: {sep:.4f} degrees')
            else:
                self.stdout.write(f'No conjunctions found for {pair} in this period.')
