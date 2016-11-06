#!/bin/bash

# All the arguments passed into Chromium here should work on Chrome also, with appropriate modifications to the paths.
# --disable-web-security is for allowing cross-domain requests (which the browser normally prevents)
# There's no requirement to run with incognito

chromium --user-data-dir=/tmp/nosecurityffa_chromium --disable-web-security --incognito "file://$(dirname $(readlink -f $0))/index.html"
