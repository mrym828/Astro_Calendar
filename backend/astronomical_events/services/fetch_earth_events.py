import requests
from skyfield.api import load,wgs84
import math
import numpy as np
from datetime import datetime

# Constants
G = 6.67430e-11  # gravitational constant
M = 1.9885e30    # mass of the sun in kg
AU = 1.496e11    # 1 Astronomical Unit in meters (semi-major axis of Earth's orbit)

def fetchEarthPosition(year: int):
    api_url = f'https://aa.usno.navy.mil/api/seasons?year={year}'
    try:
        response = requests.get(api_url, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data['data']
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return []

def get_earth_sun_distance(date_str):
    ts = load.timescale()
    t = ts.utc(int(date_str[:4]), int(date_str[5:7]), int(date_str[8:10]))
    planets = load('de421.bsp')
    earth, sun = planets['earth'], planets['sun']
    astrometric = earth.at(t).observe(sun).apparent()
    distance_km = astrometric.distance().km
    return round(distance_km / 1_000_000, 4), distance_km * 1000  

def calculate_orbital_speed(r_meters):
    # v = sqrt(G * M * (2/r - 1/a))
    v = math.sqrt(G * M * (2 / r_meters - 1 / AU))
    return round(v / 1000, 2) 

def calculate_solar_irradiance(r_meters):
    I_0 = 1361  # W/m²
    r_0 = 1.496e11  # meters (1 AU)
    irradiance = I_0 * (r_0 / r_meters) ** 2
    return round(irradiance, 2) 


def get_season_from_date(month: int, day: int) -> str:
    if (month == 12 and day >= 21) or (month <= 3 and day < 20):
        return "Winter"
    elif (month == 3 and day >= 20) or (month <= 6 and day < 21):
        return "Spring"
    elif (month == 6 and day >= 21) or (month <= 9 and day < 22):
        return "Summer"
    elif (month == 9 and day >= 22) or (month <= 12 and day < 21):
        return "Autumn"
    return "Unknown"

def generate_event_overview(event):
    phenom = event['phenom'].lower()
    season = event['season']
    date_str = f"{event['year']}-{event['month']:02d}-{event['day']:02d}"
    time = event['time']
    distance = event['distance_million_km']
    speed = event['orbital_speed_km_s']

    if "aphelion" in phenom:
        return (
            f"Aphelion occurs on {date_str} at {time}, when Earth is farthest from the Sun at approximately "
            f"{distance} million km. Despite being summer in the Northern Hemisphere, Earth receives about 7% less "
            f"solar energy than at perihelion due to this increased distance.\n\n"
            "This illustrates that seasons are caused by Earth's axial tilt, not distance from the Sun. "
            "Earth moves slightly slower at aphelion—around "
            f"{speed} km/s—resulting in a slightly longer summer season in the Northern Hemisphere."
        )
    elif "perihelion" in phenom:
        return (
            f"Perihelion occurs on {date_str} at {time}, when Earth is closest to the Sun, about "
            f"{distance} million km away. Surprisingly, this happens during the Northern Hemisphere's winter.\n\n"
            "At this point, Earth moves faster in its orbit—around "
            f"{speed} km/s—causing the Northern winter to be a bit shorter. "
            "This proves that the seasons are due to Earth's tilt, not how close it is to the Sun."
        )
    elif "equinox" in phenom:
        return (
            f"The Equinox on {date_str} at {time} marks the beginning of {season}. "
            "On this day, day and night are nearly equal in length across the globe.\n\n"
            "This happens because Earth's tilt is perpendicular to the Sun, allowing both hemispheres "
            "to receive equal sunlight. Earth's distance from the Sun is about "
            f"{distance} million km, and it orbits at around {speed} km/s."
        )
    elif "solstice" in phenom:
        return (
            f"The Solstice on {date_str} at {time} signals the start of {season}. "
            "It represents the longest (or shortest) day of the year depending on the hemisphere.\n\n"
            "At solstice, Earth's axial tilt is most pronounced toward or away from the Sun. "
            f"Earth is approximately {distance} million km from the Sun and moves at about {speed} km/s in its orbit."
        )
    else:
        return (
            f"On {date_str} at {time}, Earth reaches a key orbital point: {event['phenom']}. "
            f"It is {distance} million km from the Sun and moving at {speed} km/s.\n\n"
            "This moment contributes to the rhythm of our planet’s seasonal and solar cycles."
        )

def get_orbital_eccentricity(date_str):
    ts = load.timescale()
    t = ts.utc(int(date_str[:4]), int(date_str[5:7]), int(date_str[8:10]))
    planets = load('de421.bsp')

    earth = planets['earth']
    sun = planets['sun']

    astrometric = earth.at(t).observe(sun)
    pos_au = astrometric.position.au  
    vel_au_per_d = astrometric.velocity.au_per_d  

    AU = 1.496e11  
    day_sec = 86400 

    r_vec = np.array(pos_au) * AU  
    v_vec = np.array(vel_au_per_d) * AU / day_sec 

    mu = 1.32712440018e20  

    h_vec = np.cross(r_vec, v_vec)
    e_vec = (np.cross(v_vec, h_vec) / mu) - (r_vec / np.linalg.norm(r_vec))
    eccentricity = np.linalg.norm(e_vec)
    return round(eccentricity, 5)

def get_heliocentric_longitude(date_str):
    ts = load.timescale()
    t = ts.utc(int(date_str[:4]), int(date_str[5:7]), int(date_str[8:10]))
    planets = load('de421.bsp')

    earth = planets['earth']
    sun = planets['sun']

    # Position of Earth relative to Sun
    astrometric = earth.at(t).observe(sun)
    # ecliptic position
    ecliptic_pos = astrometric.ecliptic_position()

    x, y, z = ecliptic_pos.au  # AU in ecliptic cartesian coords

    # Computed longitude as arctangent(y/x) in degrees, normalized to 0-360°
    longitude_rad = math.atan2(y, x)
    longitude_deg = math.degrees(longitude_rad)
    if longitude_deg < 0:
        longitude_deg += 360

    return round(longitude_deg, 3)

def calculate_solar_declination(date_str):
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    n = date_obj.timetuple().tm_yday
    # Solar declination formula in degrees
    decl = -23.44 * math.cos(math.radians((360 / 365) * (n + 10)))
    return round(decl, 3)

def calculate_day_length_equator(solar_declination_deg):
    phi = 0
    delta = math.radians(solar_declination_deg)
    
    try:
        hour_angle = math.acos(-math.tan(math.radians(phi)) * math.tan(delta))
    except ValueError:
        hour_angle = 0

    day_length = (2 * hour_angle / (2 * math.pi)) * 24
    return round(day_length, 3)

def calculate_true_anomaly(date_str):
    ts = load.timescale()
    t = ts.utc(int(date_str[:4]), int(date_str[5:7]), int(date_str[8:10]))
    planets = load('de421.bsp')

    earth = planets['earth']
    sun = planets['sun']

    astrometric = earth.at(t).observe(sun)
    pos_au = np.array(astrometric.position.au)
    vel_au_per_d = np.array(astrometric.velocity.au_per_d)

    AU = 1.496e11
    day_sec = 86400

    r_vec = pos_au * AU  
    v_vec = vel_au_per_d * AU / day_sec  

    mu = 1.32712440018e20  # Sun's gravitational parameter

    h_vec = np.cross(r_vec, v_vec)
    e_vec = (np.cross(v_vec, h_vec) / mu) - (r_vec / np.linalg.norm(r_vec))
    e_mag = np.linalg.norm(e_vec)

    # True anomaly calculation
    dot_er = np.dot(e_vec, r_vec)
    r_mag = np.linalg.norm(r_vec)
    cos_nu = dot_er / (e_mag * r_mag)
    cos_nu = np.clip(cos_nu, -1.0, 1.0) 
    nu_rad = math.acos(cos_nu)

    if np.dot(r_vec, v_vec) < 0:
        nu_rad = 2 * math.pi - nu_rad

    return round(math.degrees(nu_rad), 3)


def get_annotated_earth_positions(year: int):
    events = fetchEarthPosition(year)
    for event in events:
        date_str = f"{event['year']}-{str(event['month']).zfill(2)}-{str(event['day']).zfill(2)}"
        distance_million_km, r_meters = get_earth_sun_distance(date_str)
        event['distance_million_km'] = distance_million_km
        event['orbital_speed_km_s'] = calculate_orbital_speed(r_meters)
        event['season'] = get_season_from_date(event['month'], event['day'])
        event['overview'] = generate_event_overview(event)
        event['solar_irradiance_w_m2'] = calculate_solar_irradiance(r_meters)
        event['eccentricity'] = get_orbital_eccentricity(date_str)
        event['heliocentric_longitude'] = get_heliocentric_longitude(date_str)
        event['solar_declination'] = calculate_solar_declination(date_str)
        event['day_length_equator'] = calculate_day_length_equator(event['solar_declination'])
        event['true_anomaly'] = calculate_true_anomaly(date_str)
 
    return events

