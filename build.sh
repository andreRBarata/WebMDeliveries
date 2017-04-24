#!/bin/bash

cd deliveries
cordova build browser
sudo docker build -t andrerbarata/webmdeliveries ../
sudo docker stop admiring_minsky
sudo docker rm admiring_minsky
sudo docker run --net="host" -e DEV=true --name=admiring_minsky -p 80:80 andrerbarata/webmdeliveries
