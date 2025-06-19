from celery import shared_task
from .models import APIDataSource, CelestialEvent
from django.utils import timezone
from services.api_service import fetch_sunrise_sunset_for_all_locations

@shared_task
def update_sunrise_sunset_events():
    from datetime import date
    fetch_sunrise_sunset_for_all_locations(date.today().isoformat())
