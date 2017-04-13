#!/bin/bash

cordova build browser
sudo docker build -t andrerbarata/webmdeliveries .
sudo docker stop admiring_minsky
sudo docker rm admiring_minsky
sudo docker run --net="host" --name=admiring_minsky -p 8000:8000 andrerbarata/webmdeliveries
