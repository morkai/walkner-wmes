#!/bin/sh

SearchAndActivate() {
	WID=$(xdotool search --name "$1")

	if [ $WID ]
	then
		xdotool search --name "$1" windowactivate
		exit 0
	fi
}

SearchAndActivate "walkner-wmes"
SearchAndActivate "Wannabe MES"

nohup chromium "--app=http://192.168.21.60:6080/?COMPUTERNAME=$HOSTNAME#production/$1" > /dev/null &
disown -h %1
