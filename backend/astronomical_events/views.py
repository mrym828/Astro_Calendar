from rest_framework import viewsets , generics
from django.utils import timezone
from datetime import date
from .models import *
from .serializers import (
    CelestialEventSerializer,
    LocationSerializer,
    SubscriptionSerializer,
    HolidaySerializer,
    EventImageSerializer,
    NewsletterSubscriberSerializer,
    VisibilityDetailSerializer,
    SunDataSerializer
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
    
class SunDataViewSet(viewsets.ModelViewSet):
      queryset = SunData.objects.all()
      serializer_class = SunDataSerializer
    
      def get_queryset(self):
        queryset = SunData.objects.all()
        
        # Filter by location if provided
        location_id = self.request.query_params.get('location')
        if location_id:
            queryset = queryset.filter(location_id=location_id)
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
            
        # Filter for today's data if requested
        today = self.request.query_params.get('today')
        if today and today.lower() == 'true':
            queryset = queryset.filter(date=date.today())
        
        return queryset.order_by('-date')

class TodaysSunDataView(generics.ListAPIView):
    """
    API endpoint to get today's sun data for all locations or a specific location
    """
    serializer_class = SunDataSerializer
    
    def get_queryset(self):
        today = date.today()
        queryset = SunData.objects.filter(date=today)
        
        location_id = self.request.query_params.get('location')
        if location_id:
            queryset = queryset.filter(location_id=location_id)
            
        return queryset.order_by('location__name')