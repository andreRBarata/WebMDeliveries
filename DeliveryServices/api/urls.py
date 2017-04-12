from django.conf import settings
from django.conf.urls import include, url

from . import views

urlpatterns = [
	url(r'^login/', views.auth_login),
	url(r'^user/', views.user, name='user')
]
