from rest_framework import serializers
from .models import CelestialEvent, Location, Holiday, EventImage, Subscription, NewsletterSubscriber, VisibilityDetail, SunData

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

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