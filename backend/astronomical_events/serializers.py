from rest_framework import serializers
from .models import CelestialEvent, Location, Holiday, EventImage, Subscription, NewsletterSubscriber, VisibilityDetail

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

class VisibilityDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisibilityDetail
        fields = '__all__'