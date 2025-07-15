from rest_framework import serializers
from .models import CelestialEvent, EarthOrbitEvent, Location, Holiday, EventImage, PlanetaryEvent, Subscription, NewsletterSubscriber, VisibilityDetail, SunData, MoonPhase,Eclipse
from django.utils import timezone

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = [
            'id', 'name', 'latitude', 'longitude', 'timezone', 
            'country_code', 'elevation_meters', 'light_pollution_level'
        ]
        read_only_fields = ['id']
    
    def to_internal_value(self, data):
        """Convert incoming data to internal representation"""
        # Handle timezone string conversion
        if 'timezone' in data and isinstance(data['timezone'], str):
            # The timezone string will be automatically converted to ZoneInfo by Django
            pass
        return super().to_internal_value(data)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Handle timezone conversion more robustly
        if hasattr(instance, 'timezone') and instance.timezone:
            if hasattr(instance.timezone, 'zone'):
                # It's a ZoneInfo object
                data['timezone'] = str(instance.timezone)
            elif isinstance(instance.timezone, str):
                # It's already a string
                data['timezone'] = instance.timezone
            else:
                # Fallback
                data['timezone'] = str(instance.timezone)
        else:
            data['timezone'] = 'UTC'  # Default fallback
        
        return data
    
    def validate_latitude(self, value):
        if not (-90 <= float(value) <= 90):
            raise serializers.ValidationError("Latitude must be between -90 and 90 degrees")
        return value
    
    def validate_longitude(self, value):
        if not (-180 <= float(value) <= 180):
            raise serializers.ValidationError("Longitude must be between -180 and 180 degrees")
        return value
    
    def validate_light_pollution_level(self, value):
        if not (1 <= value <= 9):
            raise serializers.ValidationError("Light pollution level must be between 1 and 9 (Bortle scale)")
        return value
    
    def validate_country_code(self, value):
        if value and len(value) not in [2, 3]:
            raise serializers.ValidationError("Country code must be 2 or 3 characters long")
        return value.upper() if value else ''

class EventImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventImage
        fields = '__all__'

class CelestialEventSerializer(serializers.ModelSerializer):
    event_images = EventImageSerializer(many=True, read_only=True)

    class Meta:
        model = CelestialEvent
        fields = '__all__'

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = '__all__'

class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['email']

class VisibilityDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisibilityDetail
        fields = '__all__'

class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['email']

class SunDataSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    
    class Meta:
        model = SunData
        fields = ['id', 'date', 'location_name', 'sunrise', 'sunset', 'created_at']
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        """
        Customize the output format to include calculated fields
        """
        representation = super().to_representation(instance)
        
        # Calculate daylight duration
        if instance.sunrise and instance.sunset:
            from datetime import datetime
            sunrise_dt = datetime.combine(instance.date, instance.sunrise)
            sunset_dt = datetime.combine(instance.date, instance.sunset)
            daylight_duration = sunset_dt - sunrise_dt
            representation['daylight_duration_hours'] = round(daylight_duration.total_seconds() / 3600, 2)
        
        return representation
    

class MoonPhaseSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    phase_display = serializers.CharField(source='get_phase_display', read_only=True)
    
    class Meta:
        model = MoonPhase
        fields = [
            'id', 'name', 'event_type', 'date_time', 'end_time',
            'description', 'location', 'location_name', 'magnitude',
            'coordinates', 'is_featured', 'importance_level',
            'duration_minutes', 'viewing_difficulty', 'slug',
            'meta_description', 'phase', 'phase_display',
            'illumination_percentage', 'angular_diameter',
            'distance_km', 'moon_age_days', 'zodiac_sign',
            'lunation_number', 'is_supermoon'
        ]
        read_only_fields = ['id', 'slug']
    
    def to_representation(self, instance):
        """Customize the output format"""
        representation = super().to_representation(instance)
        
        # Add moon icon
        icons = {
            'new_moon': '🌑',
            'waxing_crescent': '🌒',
            'first_quarter': '🌓',
            'waxing_gibbous': '🌔',
            'full_moon': '🌕',
            'waning_gibbous': '🌖',
            'last_quarter': '🌗',
            'waning_crescent': '🌘'
        }
        representation['icon'] = icons.get(instance.phase, '🌙')
        
        # Add relative time information
        
        now = timezone.now()
        if instance.date_time > now:
            delta = instance.date_time - now
            days = delta.days
            hours = delta.seconds // 3600
            if days > 0:
                representation['time_until'] = f"in {days} days"
            elif hours > 0:
                representation['time_until'] = f"in {hours} hours"
            else:
                representation['time_until'] = "soon"
        else:
            delta = now - instance.date_time
            days = delta.days
            if days == 0:
                representation['time_until'] = "today"
            elif days == 1:
                representation['time_until'] = "yesterday"
            else:
                representation['time_until'] = f"{days} days ago"
        
        return representation

class EarthOrbitEventSerializer(serializers.ModelSerializer):
   
    class Meta:
        model = EarthOrbitEvent
        fields = [
            'id',
            'phenom',
            'date',
            'time',
            'season',
            'distance_million_km',
            'orbital_speed_km_s',
            'solar_irradiance_w_m2',
            'eccentricity',
            'heliocentric_longitude',
            'true_anomaly',
            'solar_declination',
            'day_length_hours',
            'overview',
        ]
        read_only_fields = ['id']

    def to_representation(self, instance):
        """
        Custom representation to format numerical values
        """
        data = super().to_representation(instance)
        
        numerical_fields = [
            'distance_million_km',
            'orbital_speed_km_s', 
            'solar_irradiance_w_m2',
            'eccentricity',
            'heliocentric_longitude',
            'true_anomaly',
            'solar_declination',
            'day_length_hours'
        ]
        
        for field in numerical_fields:
            if data.get(field) is not None:
                data[field] = float(data[field])
        
        return data
    
class PlanetaryEventSerializer(serializers.ModelSerializer):
    base_event = CelestialEventSerializer(source='celestialevent_ptr', read_only=True)

    class Meta:
        model = PlanetaryEvent
        fields = [
            'id', 'planet_name', 'constellation', 'apparent_magnitude',
            'angular_diameter', 'distance_au', 'phase_percentage',
            'right_ascension', 'declination', 'elongation', 'base_event'
        ]

class EclipseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Eclipse
        fields = [
            'id',
            'name',
            'event_type',
            'date_time',
            'end_time',
            'description',
            'external_id',
            'eclipse_type',
            'obscuration_percentage',
            'partial_begin_altitude',
            'total_begin_altitude',
            'peak_altitude',
            'total_end_altitude',
            'partial_end_altitude',
            'visibility_regions',
            'duration_seconds',
            'raw_api_data',
            'importance_level',
            'coordinates',
            'api_source',
            'location',
        ]
        read_only_fields = ['id', 'raw_api_data']