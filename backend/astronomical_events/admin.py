from django.contrib import admin
from .models import *
# Register your models here.

@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'subscribed_at')
    search_fields = ('email',)

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude', 'timezone', 'country_code', 'last_api_update')
    search_fields = ('name', 'country_code')
    list_filter = ('country_code',)

@admin.register(APIDataSource)
class APIDataSourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'base_url', 'api_key_required', 'rate_limit_per_hour', 'current_usage', 'is_active', 'reliability_score')
    list_filter = ('api_key_required', 'is_active')
    search_fields = ('name',)

@admin.register(CelestialEvent)
class CelestialEventAdmin(admin.ModelAdmin):
    list_display = ('name', 'event_type', 'date_time', 'location', 'api_source', 'is_featured', 'importance_level')
    list_filter = ('event_type', 'importance_level', 'is_featured')
    search_fields = ('name', 'description')

@admin.register(MoonPhase)
class MoonPhaseAdmin(admin.ModelAdmin):
    list_display = ('name', 'phase', 'illumination_percentage', 'date_time')
    list_filter = ('phase', 'is_supermoon')

@admin.register(Eclipse)
class EclipseAdmin(admin.ModelAdmin):
    list_display = ('name', 'eclipse_type', 'obscuration_percentage', 'date_time')
    list_filter = ('eclipse_type',)

@admin.register(PlanetaryEvent)
class PlanetaryEventAdmin(admin.ModelAdmin):
    list_display = ('name', 'planet_name', 'constellation', 'apparent_magnitude', 'date_time')
    list_filter = ('planet_name',)

@admin.register(MeteorShower)
class MeteorShowerAdmin(admin.ModelAdmin):
    list_display = ('name', 'zhr', 'peak_date_time', 'parent_body')
    list_filter = ('parent_body',)

@admin.register(EventImage)
class EventImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'celestial_event', 'is_primary', 'uploaded_at')
    search_fields = ('title',)

@admin.register(APIUsageLog)
class APIUsageLogAdmin(admin.ModelAdmin):
    list_display = ('api_source', 'endpoint', 'request_time', 'response_status', 'success')
    list_filter = ('api_source', 'success')
    search_fields = ('endpoint', 'error_message')

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('email', 'frequency', 'is_active', 'created_at')
    list_filter = ('is_active', 'frequency')
    search_fields = ('email',)

@admin.register(VisibilityDetail)
class VisibilityDetailAdmin(admin.ModelAdmin):
    list_display = ('celestial_event', 'location', 'visible', 'best_viewing_start', 'best_viewing_end')
    list_filter = ('visible', 'light_pollution_level')
    search_fields = ('celestial_event__name', 'location__name')

@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'country_code', 'is_public')
    list_filter = ('country_code', 'is_public')
    search_fields = ('name', 'country_code')