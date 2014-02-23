ply format parser for USCO project, based on THREE.js PLY parser


General information
-------------------
This repository contains both the:
- node.js version:
ply-parser.js at the root of the project
- polymer.js/browser version which is a combo of
lib/ply-parser.js (browserified version of the above)
ply-parser.html


How to generate browser/polymer.js version (with require support):
------------------------------------------------------------------
Type: 

    browserify ply-parser.js -r ./ply-parser.js:ply-parser -o lib/ply-parser.js -x composite-detect -x three

then replace (manually for now) all following entries in the generated file:

  "composite-detect":"awZPbp","three":"Wor+Zu"

with the correct module names, ie:

   "composite-detect":"composite-detect","three":"three"
