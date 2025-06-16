from rest_framework import viewsets , generics
from .models import CelestialEvent, Location, Subscription, Holiday, EventImage , NewsletterSubscriber, VisibilityDetail
from .serializers import (
    CelestialEventSerializer,
    LocationSerializer,
    SubscriptionSerializer,
    HolidaySerializer,
    EventImageSerializer,
    NewsletterSubscriberSerializer,
    VisibilityDetailSerializer,
)

class CelestialEventViewSet(viewsets.ModelViewSet):
    queryset = CelestialEvent.objects.all()
    serializer_class = CelestialEventSerializer

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer

class HolidayViewSet(viewsets.ModelViewSet):
    queryset = Holiday.objects.all()
    serializer_class = HolidaySerializer

class EventImageViewSet(viewsets.ModelViewSet):
    queryset = EventImage.objects.all()
    serializer_class = EventImageSerializer

class NewsletterSubscribeView(generics.CreateAPIView):
    queryset = NewsletterSubscriber.objects.all()
    serializer_class = NewsletterSubscriberSerializer

class VisibilityDetailList(generics.ListAPIView):
    serializer_class = VisibilityDetailSerializer

    def get_queryset(self):
        location_id = self.request.query_params.get('location')
        if location_id:
            return VisibilityDetail.objects.filter(location_id=location_id)
        return VisibilityDetail.objects.all()