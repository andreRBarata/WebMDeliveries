FROM python:2.7.13

RUN apt-get -qq update

RUN apt-get install -y binutils libproj-dev gdal-bin
RUN pip install django django-admin
RUN pip install django_extensions django-leaflet psycopg2
RUN pip install djangorestframework djangorestframework-gis

COPY "DeliveryServices" "/var/www"
COPY "deliveries/platforms/browser/www" "/var/www/static"
COPY "deliveries/platforms/browser/www/index.html" "/var/www/DeliveryServices/templates/"
COPY "run.sh" "/var/www"

WORKDIR /var/www/

RUN chmod +x run.sh

ENV PYTHONPATH "/bin/python"
ENV DJANGO_SETTINGS_MODULE "DeliveryServices.settings"

CMD ["./run.sh"]

EXPOSE 80
