from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'events', views.CelestialEventViewSet)
router.register(r'locations', views.LocationViewSet)
router.register(r'subscriptions', views.SubscriptionViewSet)
router.register(r'holidays', views.HolidayViewSet)
router.register(r'images', views.EventImageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('subscribe/', views.NewsletterSubscribeView.as_view()),
    path('visibility/', views.VisibilityDetailList.as_view()),
]
