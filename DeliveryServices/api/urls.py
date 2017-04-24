from django.conf import settings
from django.conf.urls import include, url

from . import views

urlpatterns = [
	url(r'^login/', views.auth_login, name='login'),
	url(r'^user/', views.user, name='user'),
	url(r'^delivery/', views.delivery, name='delivery')
]
