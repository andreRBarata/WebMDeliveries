#!/bin/bash

cordova build browser
sudo docker build -t deliveries .
sudo docker stop admiring_minsky
sudo docker rm admiring_minsky
sudo docker run --name=admiring_minsky -p 8000:8000 deliveries
