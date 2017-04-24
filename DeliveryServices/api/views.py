# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import HttpResponse, JsonResponse
from rest_framework.response import Response
from django.shortcuts import render

from django.contrib.auth import authenticate, login, logout, get_user_model
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework import permissions, authentication, status, generics
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.decorators import method_decorator

from models import User, Delivery

# Create your views here.
def user(request):
    if (not request.POST["username"]) or (not request.POST["password"]):
        return Response({"detail": "Missing username and/or password"}, status=status.HTTP_400_BAD_REQUEST)

        User.objects.create(
            request.POST["username"],
            request.POST["password"]
        )

    return Response({"success": True})

def delivery(request):
    def post():
        Delivery.objects.create(
            by = request.user,
            origin = request.POST['origin'],
            destination = request.POST['destination'],
            date = request.POST['date']
        )

    def get():
        print_r(Delivery.objects.get(
			by = request.user
		))

    if (request.method == 'GET'):
        return JsonResponse(get())
    elif (request.method == 'POST'):
        return JsonResponse({'success': post()})
    else:
        return JsonResponse({'success': False})


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
        return Response({"detail": "Invalid User Id of Password"}, status=status.HTTP_400_BAD_REQUEST)
