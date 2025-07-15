from django.db import models
from django.utils import timezone
import uuid
from timezone_field import TimeZoneField
from django.core.validators import MinValueValidator, MaxValueValidator


class ApiSource(models.Model):
    name = models.CharField(max_length=100)
    base_url = models.URLField()
    
    def __str__(self):
        return self.name
    
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
    elevation_meters = models.IntegerField(default=0, help_text="Elevation above sea level in meters")
    light_pollution_level = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(9)],
        help_text="Bortle scale: 1=excellent dark sky, 9=inner city sky"
    )
    
    class Meta:
        db_table = 'locations'
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
        ]

        

class CelestialEvent(models.Model):
    EVENT_TYPES = [
        ('moon_phase', 'Moon Phase'),
        ('eclipse', 'Eclipse'),
        ('meteor_shower', 'Meteor Shower'),
        ('planetary_event', 'Planetary Event'),
        ('sunrise_sunset', 'Sunrise/Sunset'),
        ('astronomical_twilight', 'Astronomical Twilight'),
        ('conjunction', 'Conjunction'),
        ('opposition', 'Opposition'),
        ('moon_apogee', 'Moon Apogee'),
        ('moon_perigee', 'Moon Perigee'), 
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=200)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    date_time = models.DateTimeField(db_index=True)
    end_time = models.DateTimeField(null=True, blank=True)
    description = models.TextField()
    external_id = models.CharField(max_length=255, unique=True, help_text="External API identifier")
    raw_api_data = models.JSONField(default=dict, help_text="Raw data from external API")
    last_updated_from_api = models.DateTimeField(auto_now_add=True, help_text="When this record was last updated from API")
    api_source = models.ForeignKey(ApiSource, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, null=True, blank=True)
    magnitude = models.FloatField(null=True, blank=True)
    coordinates = models.JSONField(default=dict, help_text="Sky coordinates from API")
    is_featured = models.BooleanField(default=False)
    importance_level = models.IntegerField(default=2, choices=[(1, 'Minor'), (2, 'Significant'), (3, 'Major'), (4, 'Critical')])
    duration_minutes = models.IntegerField(null=True, blank=True)
    viewing_difficulty = models.CharField(
        max_length=20,
        choices=[
            ('easy', 'Easy - Naked Eye'),
            ('moderate', 'Moderate - Binoculars'),
            ('difficult', 'Difficult - Telescope Required'),
            ('expert', 'Expert - Advanced Equipment'),
        ],
        default='easy'
    )

    slug = models.SlugField(max_length=250, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)

    class Meta:
        db_table = 'celestial_events'
        indexes = [
            models.Index(fields=['date_time', 'event_type']),
            models.Index(fields=['location', 'date_time']),
            models.Index(fields=['importance_level', 'date_time']),
            models.Index(fields=['is_featured']),
        ]
        ordering = ['date_time']
    
    @property
    def is_upcoming(self):
        return self.date_time > timezone.now()
    
    @property
    def is_happening_now(self):
        now = timezone.now()
        if self.end_time:
            return self.date_time <= now <= self.end_time
        return abs((self.date_time - now).total_seconds()) < 3600
    
    @property
    def time_until_event(self):
        if self.is_upcoming:
            return self.date_time - timezone.now()
        return None
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(f"{self.name}-{self.date_time.strftime('%Y-%m-%d')}")
            self.slug = base_slug
        super().save(*args, **kwargs)


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
    illumination_percentage = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)]
    )
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
    obscuration_percentage = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        null=True, blank=True 
    )
    partial_begin_altitude = models.FloatField(null=True, blank=True)
    total_begin_altitude = models.FloatField(null=True, blank=True)
    peak_altitude = models.FloatField(null=True, blank=True)
    total_end_altitude = models.FloatField(null=True, blank=True)
    partial_end_altitude = models.FloatField(null=True, blank=True)
    visibility_regions = models.JSONField(default=list, help_text="Where eclipse is visible")
    duration_seconds = models.IntegerField(null=True, blank=True)
    
    class Meta:
        db_table = 'eclipse_events'

class PlanetaryEvent(CelestialEvent):
    planet_name = models.CharField(max_length=50)
    constellation = models.CharField(max_length=50)
    apparent_magnitude = models.FloatField()
    angular_diameter = models.FloatField(null=True, blank=True)
    distance_au = models.FloatField(null=True, blank=True)
    phase_percentage = models.FloatField(null=True, blank=True)  
    right_ascension = models.FloatField(null=True, blank=True)
    declination = models.FloatField(null=True, blank=True)
    elongation = models.FloatField(null=True, blank=True)
    
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

class Subscription(models.Model):
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

class SunData(models.Model):
    date = models.DateField()
    location = models.ForeignKey(Location, on_delete=models.CASCADE, null=True, blank=True)
    sunrise = models.TimeField()
    sunset = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.date} - Sunrise: {self.sunrise}, Sunset: {self.sunset}"
    
class EarthOrbitEvent(models.Model):
    PHENOMENON_CHOICES = [
        ('Perihelion', 'Perihelion'),
        ('Aphelion', 'Aphelion'),
        ('March Equinox', 'March Equinox'),
        ('June Solstice', 'June Solstice'),
        ('September Equinox', 'September Equinox'),
        ('December Solstice', 'December Solstice'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phenom = models.CharField(max_length=50, choices=PHENOMENON_CHOICES)
    date = models.DateField()
    time = models.TimeField()

    distance_million_km = models.FloatField()
    orbital_speed_km_s = models.FloatField()
    solar_irradiance_w_m2 = models.FloatField()
    eccentricity = models.FloatField()
    heliocentric_longitude = models.FloatField()
    true_anomaly = models.FloatField()
    solar_declination = models.FloatField()
    day_length_hours = models.FloatField(help_text="Day length at equator")

    season = models.CharField(max_length=20)
    overview = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'earth_orbit_events'
        ordering = ['date']

    def __str__(self):
        return f"{self.phenom} on {self.date}"
