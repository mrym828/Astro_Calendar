from django.core.management.base import BaseCommand
from astronomical_events.services.api_service import fetch_sunrise_sunset
from astronomical_events.models import Location

class Command(BaseCommand):
    help = 'Fetches sunrise and sunset data from API and saves it to the database'

    def handle(self, *args, **options):
        location = Location.objects.get_or_create(
            name='Sharjah', 
            latitude=25.348766, 
            longitude=55.405403
        )[0]

        # Call your function
        fetch_sunrise_sunset(location, "2025-06-18")

        self.stdout.write(self.style.SUCCESS('Sun data fetched and saved!'))