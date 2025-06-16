import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'astrocalendar_backend.settings')
app = Celery('astrocalendar_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()