#!/bin/bash
BASE=$(dirname "$(realpath $BASH_SOURCE)")

PYTHON="$(realpath "$BASE/../pythonData/bin/python2")"
MANAGE="$(realpath "$BASE/DeliveryServices/manage.py")"


"$PYTHON" "$MANAGE" $@
