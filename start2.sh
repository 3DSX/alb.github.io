#!/bin/bash

# Works on Debian (or Ubuntu's?) Chromium, since it provides the --user-data-dir flag
# All the other flags after --user-data-dir work on all Chromium or Chrome

chromium --user-data-dir=/tmp/nosecurity2_chromium --disable-web-security --incognito "file://$(dirname $(readlink -f $0))/index.html"
