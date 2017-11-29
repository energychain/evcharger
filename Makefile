#
# StromDAO Business Object - EV Charger
# Deployment via Makefile to automate general Quick Forward 
#

PROJECT = "StromDAO Business Object"

all: commit

commit: ;git add -A;git commit -a; git push;npm publish

