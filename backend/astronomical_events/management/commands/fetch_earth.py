from django.core.management.base import BaseCommand
from astronomical_events.models import EarthOrbitEvent
from astronomical_events.services.fetch_earth_events import get_annotated_earth_positions

class Command(BaseCommand):
    help = 'Fetches Earth orbit data from API and saves it to the database'

    events = get_annotated_earth_positions(2025)
    for e in events:
        EarthOrbitEvent.objects.create(
            phenom=e['phenom'],
            date=f"{e['year']}-{e['month']:02d}-{e['day']:02d}",
            time=e['time'],
            season=e['season'],
            distance_million_km=e['distance_million_km'],
            orbital_speed_km_s=e['orbital_speed_km_s'],
            solar_irradiance_w_m2=e['solar_irradiance_w_m2'],
            eccentricity=e['eccentricity'],
            heliocentric_longitude=e['heliocentric_longitude'],
            true_anomaly=e['true_anomaly'],
            solar_declination=e['solar_declination'],
            day_length_hours=e['day_length_equator'],
            overview=e['overview']
        )