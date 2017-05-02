# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import HttpResponse, JsonResponse
from rest_framework.response import Response
from django.shortcuts import render
from django.contrib.gis.geos import Point

from django.core.serializers import serialize
from django.contrib.auth import authenticate, login, logout, get_user_model
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework import permissions, authentication, status, generics
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.decorators import method_decorator

from models import User, Delivery
from serializers import DeliverySerializer

# Create your views here.
@api_view(["POST", ])
@permission_classes((permissions.AllowAny, ))
def user(request):
    if (not request.POST["username"]) or (not request.POST["password"]):
        return JsonResponse({
            "detail": "Missing username and/or password"
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        User.objects.create_user(
            username=request.POST["username"],
            email=request.POST.get("email", ""),
            password=request.POST["password"]
        ).save()

    except BaseException as e:
        return JsonResponse({
            "detail": e
        }, status=status.HTTP_400_BAD_REQUEST)

    return JsonResponse({"success": True})

@api_view(["POST", "GET"])
def delivery(request):
    def post():
        try:
            Delivery.objects.create(
                by = request.user,
                origin = Point(
                    float(request.POST["origin_lat"]),
                    float(request.POST["origin_lng"])
                ),
                destination = Point(
                    float(request.POST["destination_lat"]),
                    float(request.POST["destination_lng"])
                ),
                date = request.POST["date"]
            )
        except BaseException as e:
            return e

        return True

    def get():
        return DeliverySerializer(
            Delivery.objects.filter(
                by = request.user
            ),
            many = True
        )

    if (request.method == "GET"):
        return Response(get().data,
            content_type="application/json"
        )
    elif (request.method == "POST"):
        response = post()

        if (response != True):
            return JsonResponse({
                "success": False,
                "detail": response
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return JsonResponse({"success": True})
    else:
        return JsonResponse({
            "success": False
        }, status=status.HTTP_400_BAD_REQUEST)


# @csrf_exempt
@api_view(["POST", ])
@permission_classes((permissions.AllowAny, ))
def auth_login(request):

    if ((not request.POST["username"]) or (not request.POST["password"])):
        return Response({"detail": "Missing username and/or password"}, status=status.HTTP_400_BAD_REQUEST)

    if ((not request.POST["username"]) or (not request.POST["password"])):
        return Response({"detail": "Missing username and/or password"}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(
        username=request.POST["username"],
        password=request.POST["password"]
    )

    if user:
        if user.is_active:
            login(request, user)
            try:
                my_token = Token.objects.get(user=user)
                return Response({"token": "{}".format(my_token.key)}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"detail": "Could not get token"})
        else:
            return Response({"detail": "Inactive account"}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({"detail": "Invalid User Id or Password"}, status=status.HTTP_400_BAD_REQUEST)
