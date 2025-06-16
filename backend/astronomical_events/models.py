from django.db import models
from django.utils import timezone
import uuid
from timezone_field import TimeZoneField

class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

class Location(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=200)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    timezone = TimeZoneField()
    country_code = models.CharField(max_length=3)
    
    last_api_update = models.DateTimeField(null=True, blank=True)
    api_cache_valid_until = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'locations'
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['last_api_update']),
        ]

class APIDataSource(models.Model):
    name = models.CharField(max_length=100, unique=True)
    base_url = models.URLField()
    api_key_required = models.BooleanField(default=False)
    rate_limit_per_hour = models.IntegerField(default=1000)
    current_usage = models.IntegerField(default=0)
    last_reset = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    reliability_score = models.FloatField(default=1.0)  
    
    class Meta:
        db_table = 'api_data_sources'

class CelestialEvent(models.Model):
    EVENT_TYPES = [
        ('moon_phase', 'Moon Phase'),
        ('eclipse', 'Eclipse'),
        ('meteor_shower', 'Meteor Shower'),
        ('planetary_event', 'Planetary Event'),
        ('iss_pass', 'ISS Pass'),
        ('sunrise_sunset', 'Sunrise/Sunset'),
        ('astronomical_twilight', 'Astronomical Twilight'),
        ('conjunction', 'Conjunction'),
        ('opposition', 'Opposition'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=200)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    date_time = models.DateTimeField(db_index=True)
    end_time = models.DateTimeField(null=True, blank=True)
    description = models.TextField()
    
    api_source = models.ForeignKey(APIDataSource, on_delete=models.CASCADE)
    external_id = models.CharField(max_length=200, help_text="ID from external API")
    raw_api_data = models.JSONField(default=dict, help_text="Original API response")
    last_updated_from_api = models.DateTimeField(auto_now=True)
    
    location = models.ForeignKey(Location, on_delete=models.CASCADE, null=True, blank=True)
    
    magnitude = models.FloatField(null=True, blank=True)
    visibility_info = models.JSONField(default=dict)
    coordinates = models.JSONField(default=dict, help_text="Sky coordinates from API")
    
    is_featured = models.BooleanField(default=False)
    importance_level = models.IntegerField(default=2, choices=[(1, 'Minor'), (2, 'Significant'), (3, 'Major'), (4, 'Critical')])
    
    class Meta:
        db_table = 'celestial_events'
        unique_together = ['external_id', 'api_source', 'date_time']
        indexes = [
            models.Index(fields=['date_time', 'event_type']),
            models.Index(fields=['location', 'date_time']),
            models.Index(fields=['api_source', 'last_updated_from_api']),
        ]
    
    @property
    def is_upcoming(self):
        return self.date_time > timezone.now()
    
    @property
    def needs_api_refresh(self):
        """Check if event data needs refreshing from API"""
        if not self.last_updated_from_api:
            return True
        return (timezone.now() - self.last_updated_from_api).days > 1


class MoonPhase(CelestialEvent):
    PHASE_CHOICES = [
        ('new_moon', 'New Moon'),
        ('waxing_crescent', 'Waxing Crescent'),
        ('first_quarter', 'First Quarter'),
        ('waxing_gibbous', 'Waxing Gibbous'),
        ('full_moon', 'Full Moon'),
        ('waning_gibbous', 'Waning Gibbous'),
        ('last_quarter', 'Last Quarter'),
        ('waning_crescent', 'Waning Crescent'),
    ]
    
    phase = models.CharField(max_length=20, choices=PHASE_CHOICES)
    illumination_percentage = models.FloatField()
    angular_diameter = models.FloatField(null=True, blank=True)
    distance_km = models.FloatField(null=True, blank=True)
    moon_age_days = models.FloatField(null=True, blank=True, help_text="Days since new moon")

    zodiac_sign = models.CharField(max_length=20, blank=True)
    lunation_number = models.IntegerField(null=True, blank=True)
    is_supermoon = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'moon_phase_events'

class Eclipse(CelestialEvent):
    ECLIPSE_TYPES = [
        ('solar_total', 'Total Solar Eclipse'),
        ('solar_partial', 'Partial Solar Eclipse'),
        ('solar_annular', 'Annular Solar Eclipse'),
        ('lunar_total', 'Total Lunar Eclipse'),
        ('lunar_partial', 'Partial Lunar Eclipse'),
        ('lunar_penumbral', 'Penumbral Lunar Eclipse'),
    ]
    
    eclipse_type = models.CharField(max_length=20, choices=ECLIPSE_TYPES)
    obscuration_percentage = models.FloatField()
    path_coordinates = models.JSONField(default=list, help_text="Path coordinates from API")
    visibility_regions = models.JSONField(default=list, help_text="Where eclipse is visible")
    duration_seconds = models.IntegerField(null=True, blank=True)
    
    class Meta:
        db_table = 'eclipse_events'

class ISSPass(CelestialEvent):
    max_elevation = models.FloatField()
    direction_start = models.CharField(max_length=10) 
    direction_end = models.CharField(max_length=10)
    brightness = models.FloatField(help_text="Visual magnitude")
    duration_seconds = models.IntegerField()
    
    class Meta:
        db_table = 'iss_pass_events'

class PlanetaryEvent(CelestialEvent):
    planet_name = models.CharField(max_length=50)
    constellation = models.CharField(max_length=50)
    apparent_magnitude = models.FloatField()
    angular_diameter = models.FloatField(null=True, blank=True)
    distance_au = models.FloatField(null=True, blank=True)
    phase_percentage = models.FloatField(null=True, blank=True)  
    
    class Meta:
        db_table = 'planetary_events'

class EventImage(models.Model):
    celestial_event = models.ForeignKey(CelestialEvent, on_delete=models.CASCADE, related_name='event_images')
    title = models.CharField(max_length=255, blank=True)
    image_url = models.URLField()
    description = models.TextField(blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'event_images'
    def __str__(self):
        return f"{self.title or 'Image'} for {self.celestial_event.name}"

class APIUsageLog(models.Model):
    """Track API usage for rate limiting"""
    api_source = models.ForeignKey(APIDataSource, on_delete=models.CASCADE)
    endpoint = models.CharField(max_length=200)
    request_time = models.DateTimeField(auto_now_add=True)
    response_status = models.IntegerField()
    response_time_ms = models.IntegerField()
    success = models.BooleanField()
    error_message = models.TextField(blank=True)
    
    class Meta:
        db_table = 'api_usage_logs'
        indexes = [
            models.Index(fields=['api_source', 'request_time']),
        ]

class Subscription(models.Model):
    """User subscriptions for API-driven notifications"""
    email = models.EmailField(unique=True, default="dsjd@outlook.com")

    # API-driven preferences
    event_types = models.JSONField(default=list)
    locations = models.ManyToManyField(Location, blank=True)
    minimum_importance = models.IntegerField(default=2)
    notification_advance_hours = models.IntegerField(default=24)
    
    # Delivery preferences
    email_enabled = models.BooleanField(default=True)
    frequency = models.CharField(max_length=20, choices=[
        ('immediate', 'Immediate'),
        ('daily', 'Daily Summary'),
        ('weekly', 'Weekly Summary'),
    ], default='daily')
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'subscriptions'

    def __str__(self):
        return f'Subscription for {self.email}'

class MeteorShower(CelestialEvent):
    zhr = models.FloatField(help_text="Zenithal Hourly Rate", null=True, blank=True)
    peak_date_time = models.DateTimeField(null=True, blank=True)
    radiant_ra = models.FloatField(null=True, blank=True, help_text="Radiant Right Ascension (degrees)")
    radiant_dec = models.FloatField(null=True, blank=True, help_text="Radiant Declination (degrees)")
    duration_days = models.FloatField(null=True, blank=True, help_text="Active duration in days")
    parent_body = models.CharField(max_length=100, blank=True, help_text="Comet or asteroid source")
    velocity_kms = models.FloatField(null=True, blank=True, help_text="Meteor velocity in km/s")
    magnitude_min = models.FloatField(null=True, blank=True, help_text="Minimum visible magnitude")
    magnitude_max = models.FloatField(null=True, blank=True, help_text="Maximum visible magnitude")

    class Meta:
        db_table = 'meteor_shower_events'

class VisibilityDetail(models.Model):
    celestial_event = models.ForeignKey(CelestialEvent, on_delete=models.CASCADE, related_name='visibility_details')
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    visible = models.BooleanField(default=False)
    rise_time = models.DateTimeField(null=True, blank=True)
    set_time = models.DateTimeField(null=True, blank=True)
    best_viewing_start = models.DateTimeField(null=True, blank=True)
    best_viewing_end = models.DateTimeField(null=True, blank=True)
    weather_conditions = models.CharField(max_length=200, blank=True)
    light_pollution_level = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ('celestial_event', 'location')

class Holiday(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    date = models.DateField(db_index=True)
    country_code = models.CharField(max_length=3, help_text="ISO 3166-1 alpha-3 country code")
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=True, help_text="Whether this is a public/national holiday")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'holidays'
        unique_together = ['date', 'country_code']
        ordering = ['date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['country_code']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.country_code}) on {self.date}"
