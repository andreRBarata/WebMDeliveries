from models import User, Delivery
from django.contrib.gis.geos import MultiPoint
from rest_framework_gis import serializers as geo_serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer, GeometrySerializerMethodField


class DeliverySerializer(geo_serializers.GeoFeatureModelSerializer):
    def get_path(self, obj):
        print obj
        return MultiPoint(
            obj.destination,
            obj.origin
        )

    path = GeometrySerializerMethodField()

    class Meta:
        model = Delivery
        geo_field = "path"
        fields = ("by", "date")
