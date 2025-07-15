import logging
from django.http import JsonResponse
from rest_framework import viewsets , generics, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, date, timedelta
from rest_framework.pagination import PageNumberPagination 
from django.db.models import Q
from .models import *
from .serializers import (
    CelestialEventSerializer,
    EarthOrbitEventSerializer,
    EarthOrbitEventSerializer,
    EclipseSerializer,
    LocationSerializer,
    PlanetaryEventSerializer,
    SubscriptionSerializer,
    HolidaySerializer,
    EventImageSerializer,
    NewsletterSubscriberSerializer,
    VisibilityDetailSerializer,
    SunDataSerializer,
    MoonPhaseSerializer,
)

from rest_framework.views import APIView
from rest_framework.response import Response
from astronomical_events.services.moon_service import fetch_and_save_yearly_moon_phases
from .serializers import MoonPhaseSerializer
from datetime import datetime

class LargeResultsSetPagination(PageNumberPagination):
    page_size = 1000 
    page_size_query_param = 'page_size' 
    max_page_size = 1000

class CelestialEventViewSet(viewsets.ModelViewSet):
    queryset = CelestialEvent.objects.all()
    serializer_class = CelestialEventSerializer
    pagination_class = LargeResultsSetPagination

    @action(detail=False, methods=['get'], url_path='moon-apogee-perigee')
    def moon_apogee_perigee_events(self, request):
    
        queryset = self.get_queryset().filter(
            Q(event_type='moon_apogee') | Q(event_type='moon_perigee')
        ).order_by('date_time')

        year = request.query_params.get('year')
        if year:
            try:
                year = int(year)
                queryset = queryset.filter(date_time__year=year)
            except ValueError:
                return Response(
                    {"detail": "Invalid year format. Please provide a valid integer year."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
logger = logging.getLogger(__name__ )

class HealthCheckView(APIView):
    def get(self, request):
        return JsonResponse({
            "status": "healthy",
            "timestamp": timezone.now().isoformat()
        })

class SetLocationView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # Safe logging that handles ZoneInfo objects
            def safe_log_data(data):
                """Convert data to JSON-serializable format for logging"""
                safe_data = {}
                for key, value in data.items():
                    if hasattr(value, 'zone'):  # ZoneInfo object
                        safe_data[key] = str(value)
                    else:
                        safe_data[key] = value
                return safe_data
            
            logger.info(f"Received location data: {safe_log_data(request.data)}")
            
            serializer = LocationSerializer(data=request.data)
            if serializer.is_valid():
                location = serializer.save()
                logger.info(f"Location saved successfully: {location.id}")
                return Response({
                    "message": "Location saved successfully!",
                    "location_id": str(location.id)
                }, status=status.HTTP_201_CREATED)
            else:
                logger.warning(f"Validation errors: {serializer.errors}")
                return Response({
                    "message": "Validation failed",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error in SetLocationView: {str(e)}")
            return Response({
                "message": "Internal server error",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
    serializer_class = SunDataSerializer
    
    def get_queryset(self):
        today = date.today()
        queryset = SunData.objects.filter(date=today)
        
        location_id = self.request.query_params.get('location')
        if location_id:
            queryset = queryset.filter(location_id=location_id)
            
        return queryset.order_by('location__name')
    

class MoonPhaseViewSet(viewsets.ModelViewSet):
    queryset = MoonPhase.objects.all()
    serializer_class = MoonPhaseSerializer
    
    def get_queryset(self):
        queryset = MoonPhase.objects.all()
        
        # Filter by location if provided
        location_id = self.request.query_params.get('location')
        if location_id:
            queryset = queryset.filter(location_id=location_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date_time__gte=start_date)
        if end_date:
            queryset = queryset.filter(date_time__lte=end_date)
        
        # Filter for upcoming phases
        upcoming = self.request.query_params.get('upcoming')
        if upcoming and upcoming.lower() == 'true':
            queryset = queryset.filter(date_time__gt=timezone.now())
        
        # Filter for current month
        current_month = self.request.query_params.get('current_month')
        if current_month and current_month.lower() == 'true':
            now = timezone.now()
            start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end_of_month = (start_of_month + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            queryset = queryset.filter(date_time__range=[start_of_month, end_of_month])
        
        # Filter by phase type
        phase_type = self.request.query_params.get('phase')
        if phase_type:
            queryset = queryset.filter(phase=phase_type)
        
        return queryset.order_by('date_time')
    
    @action(detail=False, methods=['get'])
    def next_full_moon(self, request):
        """Get the next full moon"""
        next_full_moon = MoonPhase.objects.filter(
            phase='full_moon',
            date_time__gt=timezone.now()
        ).order_by('date_time').first()
        
        if next_full_moon:
            serializer = self.get_serializer(next_full_moon)
            return Response(serializer.data)
        else:
            return Response(
                {'message': 'No upcoming full moon found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def next_new_moon(self, request):
        """Get the next new moon"""
        next_new_moon = MoonPhase.objects.filter(
            phase='new_moon',
            date_time__gt=timezone.now()
        ).order_by('date_time').first()
        
        if next_new_moon:
            serializer = self.get_serializer(next_new_moon)
            return Response(serializer.data)
        else:
            return Response(
                {'message': 'No upcoming new moon found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def current_phase(self, request):
        """Get the current moon phase"""
        now = timezone.now()
        current_phase = MoonPhase.objects.filter(
            date_time__lte=now
        ).order_by('-date_time').first()
        
        if current_phase:
            serializer = self.get_serializer(current_phase)
            return Response(serializer.data)
        else:
            return Response(
                {'message': 'No current moon phase found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def fetch_phases(self, request):
        """Manually trigger fetching moon phases"""
        location_id = request.data.get('location_id')
        year = request.data.get('year', datetime.now().year)
        month = request.data.get('month', datetime.now().month)
        
        try:
            from .models import Location
            location = Location.objects.get(id=location_id) if location_id else None
            
            if not location:
                # Use default Sharjah location
                location = Location.objects.get_or_create(
                    name='Sharjah',
                    defaults={
                        'latitude': 25.348766,
                        'longitude': 55.405403,
                        'timezone': 'Asia/Dubai',
                        'country_code': 'UAE'
                    }
                )[0]
            
            phases_count = fetch_and_save_yearly_moon_phases(location, year, month)
            
            return Response({
                'message': f'Successfully fetched {phases_count} moon phases',
                'location': location.name,
                'year': year,
                'month': month
            })
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def calendar(self, request):
        """Get moon phases for the entire year, grouped by month"""
        year = int(request.query_params.get('year', datetime.now().year))
        location_id = request.query_params.get('location')

        # Prepare response container
        calendar_data = []

        # Loop through all 12 months
        for month in range(1, 13):
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = datetime(year, month + 1, 1) - timedelta(days=1)
            
            queryset = MoonPhase.objects.filter(
                date_time__date__range=[start_date.date(), end_date.date()]
            )

            if location_id:
                queryset = queryset.filter(location_id=location_id)

            phases = queryset.order_by('date_time')
            serializer = self.get_serializer(phases, many=True)

            calendar_data.append({
                'month': month,
                'phases': serializer.data
            })

        return Response({
            'year': year,
            'calendar': calendar_data
        })
    
class EarthOrbitEventViewSet(viewsets.ModelViewSet):
    queryset = EarthOrbitEvent.objects.all().order_by('-date')
    serializer_class = EarthOrbitEventSerializer

class ConstellationTransitionList(generics.ListAPIView):
    """All constellation transitions for major bodies."""
    queryset = CelestialEvent.objects.filter(event_type__in=['conjunction', 'planetary_event']).order_by('-date_time')
    serializer_class = CelestialEventSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date_time', 'name']
    search_fields = ['name', 'description', 'external_id']


class PlanetaryTransitionList(generics.ListAPIView):
    """Detailed view of planetary transitions."""
    queryset = PlanetaryEvent.objects.select_related('celestialevent_ptr').all().order_by('-date_time')
    serializer_class = PlanetaryEventSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date_time', 'planet_name']
    search_fields = ['planet_name', 'constellation']

class EclipseViewSet(viewsets.ModelViewSet):
    queryset = Eclipse.objects.all().order_by('date_time')
    serializer_class = EclipseSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'eclipse_type']
    ordering_fields = ['date_time', 'importance_level']