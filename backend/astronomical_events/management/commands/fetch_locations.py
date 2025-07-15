import time
import requests
from django.core.management.base import BaseCommand
from timezonefinder import TimezoneFinder
from astrocalendar_backend import settings
from ...models import Location  

tf = TimezoneFinder()

HEADERS = {
    "User-Agent": "DjangoAstronomyCalendarApp/1.0 (U22104273@sharjah.ac.ae)"
}

class Command(BaseCommand):
    help = "Fetch and save country centroid locations using Nominatim + timezonefinder with elevation data"

    def add_arguments(self, parser):
        parser.add_argument(
            '--countries',
            nargs='+',
            type=str,
            help='List of country names to fetch (e.g., --countries UAE Canada Japan)'
        )
        parser.add_argument(
            '--skip-elevation',
            action='store_true',
            help='Skip elevation fetching to speed up the process'
        )

    def get_elevation(self, lat, lon):
        try:
            GOOGLE_API_KEY = settings.GOOGLE_ELEVATION_API_KEY  
            if GOOGLE_API_KEY:
                url = "https://maps.googleapis.com/maps/api/elevation/json"
                params = {"locations": f"{lat},{lon}", "key": GOOGLE_API_KEY}
                response = requests.get(url, params=params, headers=HEADERS, timeout=10)
                response.raise_for_status()
                data = response.json()
                if data.get("results"):
                    elevation = data["results"][0].get("elevation", 0)
                    self.stdout.write(self.style.SUCCESS(f"   🏔️  Elevation: {elevation}m (Google)"))
                    return elevation
            else:
                self.stdout.write(self.style.WARNING("   ⚠️  Google Elevation API key not set."))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"   ⚠️  Google Elevation failed: {e}"))

        self.stdout.write(self.style.WARNING("   ⚠️  All elevation APIs failed, using 0m"))
        return 0

    def handle(self, *args, **options):
        countries = options['countries'] or [
            "United Arab Emirates", "Canada", "Japan", "United Kingdom", "United States", "Egypt"
        ]
        skip_elevation = options['skip_elevation']

        self.stdout.write(self.style.SUCCESS(f"🌍 Processing {len(countries)} countries..."))
        if skip_elevation:
            self.stdout.write(self.style.WARNING("⚠️  Skipping elevation data (--skip-elevation used)"))

        for i, country in enumerate(countries, 1):
            self.stdout.write(self.style.SUCCESS(f"\n[{i}/{len(countries)}] Processing: {country}"))
            url = "https://nominatim.openstreetmap.org/search"
            params = {
                "q": country,
                "format": "json",
                "addressdetails": 1,
                "limit": 1,
                "countrycodes": "",  
            }

            try:
                response = requests.get(url, params=params, headers=HEADERS, timeout=10)
                response.raise_for_status()
                data = response.json()

                if not data:
                    self.stdout.write(self.style.WARNING(f"   ❌ No result for {country}"))
                    continue

                result = data[0]
                lat = float(result["lat"])
                lon = float(result["lon"])
                country_code = result.get("address", {}).get("country_code", "").upper()
                timezone_str = tf.timezone_at(lat=lat, lng=lon) or "UTC"

                elevation = 0
                if not skip_elevation:
                    elevation = self.get_elevation(lat, lon)
                else:
                    self.stdout.write(self.style.WARNING(f"   ⏭️  Skipping elevation for {country}"))

                Location.objects.update_or_create(
                    name=country,
                    defaults={
                        "latitude": lat,
                        "longitude": lon,
                        "country_code": country_code,
                        "timezone": timezone_str,
                        "elevation_meters": elevation,
                        "light_pollution_level": 0,
                    }
                )

                self.stdout.write(self.style.SUCCESS(
                    f"   ✅ Saved: {country} ({lat:.4f}, {lon:.4f}, {timezone_str}, {elevation}m)"
                ))

            except requests.exceptions.RequestException as e:
                self.stdout.write(self.style.ERROR(f"   ❌ Network error for {country}: {e}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"   ❌ Error for {country}: {e}"))

            if i % 5 == 0:
                self.stdout.write(self.style.WARNING("   ⏸️  Pausing for 2 seconds..."))
                time.sleep(2)
            else:
                time.sleep(1)

        self.stdout.write(self.style.SUCCESS(f"\n🎉 Completed processing {len(countries)} countries!"))
