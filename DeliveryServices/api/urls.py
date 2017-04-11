from django.conf import settings
from django.conf.urls import include, url

import views

urlpatterns = [
	url(r'^login/', views.login)
]
