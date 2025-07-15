from celery import shared_task
from .models import Location
from .services.api_service import fetch_sunrise_sunset
from django.utils import timezone
from datetime import datetime
from astronomical_events.services.moon_service import fetch_and_save_moon_phases



@shared_task
def update_sunrise_sunset_events():
    """Update sunrise/sunset data for all locations"""
    from datetime import date
    locations = Location.objects.all()
    
    for location in locations:
        try:
            fetch_sunrise_sunset(location, date.today().isoformat())
        except Exception as e:
            print(f"Error fetching sunrise/sunset for {location.name}: {e}")

@shared_task
def update_moon_phases():
    """Update moon phase data for all locations"""
    current_time = datetime.now()
    locations = Location.objects.all()
    
    for location in locations:
        try:
            # Fetch current month's moon phases
            fetch_and_save_moon_phases(location, current_time.year, current_time.month)
            
            # Also fetch next month's data
            next_month = current_time.month + 1
            year = current_time.year
            if next_month > 12:
                next_month = 1
                year += 1
            
            fetch_and_save_moon_phases(location, year, next_month)
            
        except Exception as e:
            print(f"Error fetching moon phases for {location.name}: {e}")

@shared_task
def update_all_astronomical_data():
    """Update all astronomical data (sunrise/sunset and moon phases)"""
    update_sunrise_sunset_events.delay()
    update_moon_phases.delay()