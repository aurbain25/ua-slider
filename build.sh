#!/bin/bash

./node_modules/.bin/tsc -p tsconfig.json
./node_modules/.bin/uglifyjs --output package/ua-slider.js -- package/Option.js package/UaSlider.js
# ./node_modules/.bin/uglifyjs --compress --mangle --output package/ua-slider.js -- package/Option.js package/UaSlider.js
# rm package/UaSlider.js package/Option.js