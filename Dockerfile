FROM python:2.7.13

RUN apt-get -qq update

RUN apt-get install -y binutils libproj-dev gdal-bin
RUN pip install django django-admin
RUN pip install django_extensions django-leaflet psycopg2
RUN pip install djangorestframework djangorestframework-gis

COPY "DeliveryServices" "/var/www"
COPY "platforms/browser/www" "/var/www/static"
WORKDIR /var/www/

ENV PYTHONPATH "/bin/python"
ENV DJANGO_SETTINGS_MODULE "DeliveryServices.settings"

CMD ["python", "./manage.py", "runserver", "0.0.0.0:8000"]

EXPOSE 8000
