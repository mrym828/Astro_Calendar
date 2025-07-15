from django.core.management.base import BaseCommand
from astronomical_events.models import Location
from datetime import datetime
from astronomical_events.services.moon_service import fetch_and_save_yearly_moon_phases


class Command(BaseCommand):
    help = 'Fetches moon phase data from API and saves it to the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--location',
            type=str,
            help='Location name (default: Sharjah)',
            default='Sharjah'
        )
        parser.add_argument(
            '--year',
            type=int,
            help='Year (default: current year)',
            default=datetime.now().year
        )
        parser.add_argument(
            '--month',
            type=int,
            help='Month (default: current month)',
            default=datetime.now().month
        )
        parser.add_argument(
            '--all-locations',
            action='store_true',
            help='Fetch for all locations in database'
        )

    def handle(self, *args, **options):
        year = options['year']
        month = options['month']
        
        if options['all_locations']:
            locations = Location.objects.all()
            if not locations:
                self.stdout.write(
                    self.style.WARNING('No locations found in database')
                )
                return
        else:
            location_name = options['location']
            try:
                location = Location.objects.get(name=location_name)
                locations = [location]
            except Location.DoesNotExist:
                location = Location.objects.create(
                    name='Sharjah',
                    latitude=25.348766,
                    longitude=55.405403,
                    timezone='Asia/Dubai',
                    country_code='UAE'
                )
                locations = [location]
                self.stdout.write(
                    self.style.SUCCESS(f'Created location: {location.name}')
                )

        total_phases = 0
        for location in locations:
            try:
                phases_count = fetch_and_save_yearly_moon_phases(location, year)
                total_phases += phases_count
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Fetched {phases_count} moon phases for {location.name} ({year}-{month:02d})'
                    )
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'Error fetching moon phases for {location.name}: {str(e)}'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully fetched {total_phases} total moon phases!')
        )