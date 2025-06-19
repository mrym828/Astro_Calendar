from skyfield.api import load, Topos
from datetime import datetime, timezone

def is_event_visible(event_time, location):
    ts = load.timescale()
    t = ts.utc(event_time.year, event_time.month, event_time.day, event_time.hour)
    
    planets = load('de421.bsp')
    earth = planets['earth']
    observer = earth + Topos(latitude_degrees=location.latitude, longitude_degrees=location.longitude)
    
    sun = planets['sun']
    difference = sun - observer
    alt, az, distance = difference.at(t).altaz()
    
    return alt.degrees > 0  # Above the horizon

