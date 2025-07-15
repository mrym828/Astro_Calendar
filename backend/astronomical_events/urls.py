from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'events', views.CelestialEventViewSet)
router.register(r'locations', views.LocationViewSet)
router.register(r'subscriptions', views.SubscriptionViewSet)
router.register(r'holidays', views.HolidayViewSet)
router.register(r'images', views.EventImageViewSet)
router.register(r'sundata', views.SunDataViewSet)
router.register(r'moonphases', views.MoonPhaseViewSet)
router.register(r'earth', views.EarthOrbitEventViewSet)
router.register(r'eclipses', views.EclipseViewSet, basename='eclipse')



urlpatterns = [
    path('', include(router.urls)),
    path('subscribe/', views.NewsletterSubscribeView.as_view()),
    path('health/', views.HealthCheckView.as_view()),
    path('visibility/', views.VisibilityDetailList.as_view()),
    path('set-location/', views.SetLocationView.as_view(), name='set_location'),
    path('sun/today/', views.TodaysSunDataView.as_view(), name='todays-sun-data'),
    path('constellations/', views.ConstellationTransitionList.as_view(), name='constellation-events'),
    path('constellations/planetary/', views.PlanetaryTransitionList.as_view(), name='planetary-events'),
]
