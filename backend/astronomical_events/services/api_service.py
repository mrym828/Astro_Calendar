from datetime import datetime
import requests
from django.conf import settings
from ..models import SunData

def fetch_sunrise_sunset(location, date_str):
    url = settings.SUNRISE_SUNSET_URL  
    params = {
        "lat": float(location.latitude),
        "lng": float(location.longitude),
        "date": date_str,
        "tzid": "Asia/Dubai",
        "formatted": 0  # ISO format with timezone info
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data['status'] != 'OK':
            print("API did not return OK status")
            return None

        # Parse ISO 8601 UTC times
        sunrise_utc = datetime.fromisoformat(data['results']['sunrise'])
        sunset_utc = datetime.fromisoformat(data['results']['sunset'])

        # Save to DB
        SunData.objects.create(
            date=date_str,
            location=location,
            sunrise=sunrise_utc.time(),
            sunset=sunset_utc.time()
        )

        return data['results']

    except requests.exceptions.RequestException as e:
        print(f"Error fetching sunrise/sunset data: {e}")
        return None
