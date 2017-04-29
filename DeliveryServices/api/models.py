# -*- coding: utf-8 -*-
# from django.db import models
from django.utils import timezone
from django.contrib.gis.geos import Point

from django.contrib.gis.db import models
from django.contrib.gis import geos
from django.contrib.auth.models import AbstractUser

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

# Create your models here.
class User(AbstractUser):
    created = models.DateTimeField(
        auto_now_add=True
    )
    modified = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return "{}, ({}), last seen at {} ... cr={}, mod={}" \
            .format(self.username, self.get_full_name(), self.last_location, self.created, self.modified)

class Driver(models.Model):
    name = models.CharField(
        max_length=50
    )

class Delivery(models.Model):
    by = models.ForeignKey(
        'User',
        on_delete=models.CASCADE
    )
    driver = models.ForeignKey(
        'Driver',
        on_delete=models.CASCADE,
		null=True
    )
    origin = models.PointField()
    destination = models.PointField()
    date = models.DateTimeField()

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
