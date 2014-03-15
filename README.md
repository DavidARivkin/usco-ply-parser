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

      grunt build-browser-lib

This will generate the correct browser(ified) version of the source in the lib folder

