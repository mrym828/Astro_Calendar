from celery import shared_task
from .models import APIDataSource, CelestialEvent
from django.utils import timezone

@shared_task
def fetch_and_update_celestial_events():
    for api_source in APIDataSource.objects.filter(is_active=True):
        if api_source.current_usage >= api_source.rate_limit_per_hour:
            continue  # skip due to rate limit
        
        # Simulate API call
        # You would use requests.get with the proper headers here
        api_source.current_usage += 1
        api_source.save()
