import requests
from datetime import datetime, timezone, timedelta
from typing import List, Dict
import calendar
from skyfield.api import load
from skyfield.searchlib import find_maxima, find_minima
from ..models import MoonPhase, Location, ApiSource
from django.utils.timezone import make_aware, is_aware, now
from django.utils.text import slugify

api_source = ApiSource.objects.get_or_create(name="FarmSense", base_url="https://api.farmsense.net/v1/moonphases/")[0]

class MoonPhaseService:
    
    def __init__(self, timezone_offset: int = 4):

        self.apis = {
            'farmsense': 'https://api.farmsense.net/v1/moonphases/',
            'ipgeolocation': 'https://api.ipgeolocation.io/astronomy'
        }
        self.timezone = timezone(timedelta(hours=timezone_offset))
        self.ts = load.timescale()
        self.eph = load('de421.bsp') 
        self.earth = self.eph['earth']
        self.moon = self.eph['moon']

    def get_moon_phases_yearly_farmsense(self, year: int = None) -> List[Dict]:
        current_time = datetime.now(timezone.utc).astimezone(self.timezone)
        if year is None:
            year = current_time.year

        all_phases = []
        for month in range(1, 13):  
            print(f"📆 Fetching moon phases for {year}-{month:02d}")
            monthly_phases = self.get_moon_phases_farmsense(year=year, month=month)
            all_phases.extend(monthly_phases)
        return all_phases
    
    def get_moon_phases_farmsense(self, year: int = None, month: int = None) -> List[Dict]:

        current_time = datetime.now(timezone.utc).astimezone(self.timezone)
        
        if year is None:
            year = current_time.year
        if month is None:
            month = current_time.month
            
        days_in_month = calendar.monthrange(year, month)[1]
        moon_phases = []
        
        for day in range(1, days_in_month + 1):
            date_obj = datetime(year, month, day, 12, 0, 0, tzinfo=self.timezone)
            timestamp = int(date_obj.timestamp())
            
            url = f"{self.apis['farmsense']}?d={timestamp}"
            try:
                response = requests.get(url)
                response.raise_for_status()
                data = response.json()
                
                if data and len(data) > 0:
                    phase_data = data[0]
                    
                    phase_name = phase_data.get('Phase', 'Unknown')
                    illumination = phase_data.get('Illumination', 0)
                    
                    moon_phases.append({
                        'date': date_obj.date(),
                        'datetime': date_obj,
                        'phase': phase_name,
                        'illumination': illumination,
                        'type': 'Moon Phase',
                        'icon': self._get_moon_icon(phase_name),
                        'timezone': 'GMT+4'
                    })
            except requests.RequestException as e:
                print(f"Error fetching moon phase for {year}-{month:02d}-{day:02d}: {e}")
                continue
            except (KeyError, IndexError) as e:
                print(f"Error parsing moon phase data for {year}-{month:02d}-{day:02d}: {e}")
                continue
        
        return moon_phases
    
    def get_moon_phase_for_date(self, target_date: datetime) -> Dict:
        
        if target_date.tzinfo is None:
            target_date = target_date.replace(tzinfo=self.timezone)
        else:
            target_date = target_date.astimezone(self.timezone)
        
        date_with_time = target_date.replace(hour=12, minute=0, second=0, microsecond=0)
        timestamp = int(date_with_time.timestamp())
        
        url = f"{self.apis['farmsense']}?d={timestamp}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            if data and len(data) > 0:
                phase_data = data[0]
                
                return {
                    'date': date_with_time.date(),
                    'datetime': date_with_time,
                    'phase': phase_data.get('Phase', 'Unknown'),
                    'illumination': phase_data.get('Illumination', 0),
                    'type': 'Moon Phase',
                    'icon': self._get_moon_icon(phase_data.get('Phase', 'Unknown')),
                    'timezone': 'GMT+4'
                }
            else:
                return {}
        except requests.RequestException as e:
            print(f"Error fetching moon phase for {target_date.date()}: {e}")
            return {}
        except (KeyError, IndexError) as e:
            print(f"Error parsing moon phase data for {target_date.date()}: {e}")
            return {}
    
    def get_astronomy_data_ipgeolocation(self, api_key: str, latitude: float, longitude: float) -> Dict:
        
        params = {
            'apiKey': api_key,
            'lat': latitude,
            'long': longitude
        }
        try:
            response = requests.get(self.apis['ipgeolocation'], params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error fetching astronomy data: {e}")
            return {}
    
    def _get_moon_icon(self, phase: str) -> str:
        icons = {
            'New Moon': '🌑',
            'Waxing Crescent': '🌒',
            'First Quarter': '🌓',
            'Waxing Gibbous': '🌔',
            'Full Moon': '🌕',
            'Waning Gibbous': '🌖',
            'Last Quarter': '🌗',
            'Third Quarter': '🌗', 
            'Waning Crescent': '🌘'
        }
        return icons.get(phase, '🌙')


def save_moon_phases_to_db(phases: List[dict], location: Location):
    
    for phase in phases:
        dt = phase['datetime']
        if not is_aware(dt):
            dt = make_aware(dt)  
        
        if MoonPhase.objects.filter(date_time=dt, location=location).exists():
            continue
        
        phase_mapping = {
            'New Moon': 'new_moon',
            'Waxing Crescent': 'waxing_crescent',
            'First Quarter': 'first_quarter',
            'Waxing Gibbous': 'waxing_gibbous',
            'Full Moon': 'full_moon',
            'Waning Gibbous': 'waning_gibbous',
            'Last Quarter': 'last_quarter',
            'Third Quarter': 'last_quarter',
            'Waning Crescent': 'waning_crescent'
        }
        
        phase_choice = phase_mapping.get(phase['phase'], 'new_moon')
        
        serializable_phase = {
            'date': phase['date'].isoformat() if hasattr(phase['date'], 'isoformat') else str(phase['date']),
            'datetime': phase['datetime'].isoformat() if hasattr(phase['datetime'], 'isoformat') else str(phase['datetime']),
            'phase': phase['phase'],
            'illumination': phase['illumination'],
            'type': phase['type'],
            'icon': phase['icon'],
            'timezone': phase['timezone']
        }
        
        moon_event = MoonPhase.objects.create(
            name=f"{phase['phase']} ({dt.strftime('%Y-%m-%d')})",
            event_type='moon_phase',
            date_time=dt,
            description=f"Moon phase is {phase['phase']} with illumination {phase['illumination']}%.",
            location=location,
            importance_level=1,
            slug=slugify(f"{phase['phase']}-{dt.date()}"),
            external_id=f"moon_phase_{location.id}_{dt.strftime('%Y%m%d')}_{phase_choice}",
            raw_api_data=serializable_phase,  
            last_updated_from_api=now(),  
            phase=phase_choice,
            illumination_percentage=float(phase['illumination']),
            api_source=api_source,
        )
        print(f"✅ Saved: {moon_event}")


def fetch_and_save_yearly_moon_phases(location: Location, year: int = None):
    service = MoonPhaseService()
    phases = service.get_moon_phases_yearly_farmsense(year)
    save_moon_phases_to_db(phases, location)
    return len(phases)


