require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"8EUKqG":[function(require,module,exports){
/**
 * @author Wei Meng / http://about.me/menway
 * @author kaosat-dev
 * Description: A THREE parser for PLY ASCII files (known as the Polygon File Format or the Stanford Triangle Format).
 *
 *
 * Limitations: ASCII decoding assumes file is UTF-8.
 *
 * Usage:
 *	var loader = new PLYParser();
 *	loader.addEventListener( 'load', function ( event ) {
 *
 *		var geometry = event.content;
 *		scene.add( new THREE.Mesh( geometry ) );
 *
 *	} );
 *	loader.load( './models/ply/ascii/dolphins.ply' );
 */

var detectEnv = require("composite-detect");

if(detectEnv.isNode) var THREE = require("three");
if(detectEnv.isBrowser) var THREE = window.THREE;
if(detectEnv.isModule) var Q = require('q');


PLYParser = function () {
  this.outputs = ["geometry"]; //to be able to auto determine data type(s) fetched by parser
  
  this.defaultMaterialType = THREE.MeshPhongMaterial;//THREE.MeshLambertMaterial; //
	this.defaultColor = new THREE.Color( "#efefff" );
  this.recomputeNormals = true;
};


PLYParser.prototype = {
  constructor: PLYParser
};
	
PLYParser.prototype.parse = function ( data, parameters ) {

  var parameters = parameters || {};
  var useBuffers = parameters.useBuffers !== undefined ? parameters.useBuffers : true;
  var useWorker = parameters.useWorker !== undefined ?  parameters.useWorker && detectEnv.isBrowser: true;

  var deferred = Q.defer();
  var self = this;
  
  /*function onDataLoaded( data )
  {
      for(var i=0;i<data.objects.length;i++)
      {
        var modelData = data.objects[i];
        var model = self.createModelBuffers( modelData );
		    rootObject.add( model );
      }
  }*/
  console.log("in ply parser");
  if ( useWorker ) {
    var worker = new Worker((window.webkitURL || window.URL).createObjectURL(new Blob(['(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module \'"+o+"\'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n(function (process){\n(function () {\n  // Hueristics.\n  var isNode = typeof process !== \'undefined\' && process.versions && !!process.versions.node;\n  var isBrowser = typeof window !== \'undefined\';\n  var isModule = typeof module !== \'undefined\' && !!module.exports;\n\n  // Export.\n  var detect = (isModule ? exports : (this.detect = {}));\n  detect.isNode = isNode;\n  detect.isBrowser = isBrowser;\n  detect.isModule = isModule;\n}).call(this);\n}).call(this,require("/home/mmoissette/dev/projects/coffeescad/parsers/usco-ply-parser/node_modules/workerify/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))\n},{"/home/mmoissette/dev/projects/coffeescad/parsers/usco-ply-parser/node_modules/workerify/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":2}],2:[function(require,module,exports){\n// shim for using process in browser\n\nvar process = module.exports = {};\n\nprocess.nextTick = (function () {\n    var canSetImmediate = typeof window !== \'undefined\'\n    && window.setImmediate;\n    var canPost = typeof window !== \'undefined\'\n    && window.postMessage && window.addEventListener\n    ;\n\n    if (canSetImmediate) {\n        return function (f) { return window.setImmediate(f) };\n    }\n\n    if (canPost) {\n        var queue = [];\n        window.addEventListener(\'message\', function (ev) {\n            var source = ev.source;\n            if ((source === window || source === null) && ev.data === \'process-tick\') {\n                ev.stopPropagation();\n                if (queue.length > 0) {\n                    var fn = queue.shift();\n                    fn();\n                }\n            }\n        }, true);\n\n        return function nextTick(fn) {\n            queue.push(fn);\n            window.postMessage(\'process-tick\', \'*\');\n        };\n    }\n\n    return function nextTick(fn) {\n        setTimeout(fn, 0);\n    };\n})();\n\nprocess.title = \'browser\';\nprocess.browser = true;\nprocess.env = {};\nprocess.argv = [];\n\nfunction noop() {}\n\nprocess.on = noop;\nprocess.once = noop;\nprocess.off = noop;\nprocess.emit = noop;\n\nprocess.binding = function (name) {\n    throw new Error(\'process.binding is not supported\');\n}\n\n// TODO(shtylman)\nprocess.cwd = function () { return \'/\' };\nprocess.chdir = function (dir) {\n    throw new Error(\'process.chdir is not supported\');\n};\n\n},{}],3:[function(require,module,exports){\nvar PLY = require("./ply.js");\n\nself.onmessage = function( event ) {\n  var data = event.data;\n  data = data.data;\n\n  var result = new PLY().load( data );\n  \n  self.postMessage( {data:result} );\n\tself.close();\n\n}\n\n},{"./ply.js":4}],4:[function(require,module,exports){\nvar detectEnv = require("composite-detect");\n\nvar PLY = function () {\n\n\n  var currentObject = {};\n  currentObject._attributes =  {};\n  currentObject._attributes["position"] = [];\n  currentObject._attributes["normal"] = [];\n  currentObject._attributes["color"] = [];\n  currentObject._attributes["indices"] = [];\n  currentObject.faceCount = 0;\n  \n  this.currentObject = currentObject;\n\n}\n\nPLY.prototype = {\n  constructor: PLY\n};\n\n\nPLY.prototype.load = function( data ){\n\n  if ( data instanceof ArrayBuffer ) {\n\n      var isASCII = this.isASCII( data );\n      if(isASCII)\n      {\n        return this.parseASCII( this.bin2str( data ) ) ;\n      }\n      else\n      {\n        return( this.parseBinary( data ) );\n      }\n\n\t} else {\n\t  console.log("foo");\n\t  return this.parseASCII( data );\n\t  /*var geometry = this.parseASCII( data );\n\t  geometry.computeBoundingBox();\n    geometry.computeBoundingSphere();\n    geometry.computeVertexNormals();\n    geometry.computeFaceNormals();\n    deferred.resolve( geometry  );*/\n\t}\n\n}\n\n\nPLY.prototype.bin2str= function (buf) {\n\n\t\tvar array_buffer = new Uint8Array(buf);\n\t\tvar str = \'\';\n\t\tfor(var i = 0; i < buf.byteLength; i++) {\n\t\t\tstr += String.fromCharCode(array_buffer[i]); // implicitly assumes little-endian\n\t\t}\n\n\t\treturn str;\n\n\t},\n\n\tPLY.prototype.isASCII= function( data ){\n\n\t\tvar header = this.parseHeader( this.bin2str( data ) );\n\t\t\n\t\treturn header.format === "ascii";\n\n\t},\n\nPLY.prototype.parseHeader= function ( data ) {\n\t\t\n\t\tvar patternHeader = /ply([\\s\\S]*)end_header\\n/;\n\t\tvar headerText = "";\n\t\tif ( ( result = patternHeader.exec( data ) ) != null ) {\n\t\t\theaderText = result [ 1 ];\n\t\t}\n\t\t\n\t\tvar header = new Object();\n\t\theader.comments = [];\n\t\theader.elements = [];\n\t\theader.headerLength = result[0].length;\n\t\t\n\t\tvar lines = headerText.split( \'\\n\' );\n\t\tvar currentElement = undefined;\n\t\tvar lineType, lineValues;\n\n\t\tfunction make_ply_element_property(propertValues) {\n\t\t\t\n\t\t\tvar property = Object();\n\n\t\t\tproperty.type = propertValues[0]\n\t\t\t\n\t\t\tif ( property.type === "list" ) {\n\t\t\t\t\n\t\t\t\tproperty.name = propertValues[3]\n\t\t\t\tproperty.countType = propertValues[1]\n\t\t\t\tproperty.itemType = propertValues[2]\n\n\t\t\t} else {\n\n\t\t\t\tproperty.name = propertValues[1]\n\n\t\t\t}\n\n\t\t\treturn property\n\t\t\t\n\t\t}\n\t\t\n\t\tfor ( var i = 0; i < lines.length; i ++ ) {\n\n\t\t\tvar line = lines[ i ];\n\t\t\tline = line.trim()\n\t\t\tif ( line === "" ) { continue; }\n\t\t\tlineValues = line.split( /\\s+/ );\n\t\t\tlineType = lineValues.shift()\n\t\t\tline = lineValues.join(" ")\n\t\t\t\n\t\t\tswitch( lineType ) {\n\t\t\t\t\n\t\t\tcase "format":\n\n\t\t\t\theader.format = lineValues[0];\n\t\t\t\theader.version = lineValues[1];\n\n\t\t\t\tbreak;\n\n\t\t\tcase "comment":\n\n\t\t\t\theader.comments.push(line);\n\n\t\t\t\tbreak;\n\n\t\t\tcase "element":\n\n\t\t\t\tif ( !(currentElement === undefined) ) {\n\n\t\t\t\t\theader.elements.push(currentElement);\n\n\t\t\t\t}\n\n\t\t\t\tcurrentElement = Object();\n\t\t\t\tcurrentElement.name = lineValues[0];\n\t\t\t\tcurrentElement.count = parseInt( lineValues[1] );\n\t\t\t\tcurrentElement.properties = [];\n\n\t\t\t\tbreak;\n\t\t\t\t\n\t\t\tcase "property":\n\n\t\t\t\tcurrentElement.properties.push( make_ply_element_property( lineValues ) );\n\n\t\t\t\tbreak;\n\t\t\t\t\n\n\t\t\tdefault:\n\n\t\t\t\tconsole.log("unhandled", lineType, lineValues);\n\t\t\t\tconsole.log(lineType);\n\n\t\t\t}\n\n\t\t}\n\t\t\n\t\tif ( !(currentElement === undefined) ) {\n\n\t\t\theader.elements.push(currentElement);\n\n\t\t}\n\t\t\n\t\treturn header;\n\t\t\n\t},\n\n\t\n\n\nPLY.prototype.parseASCIINumber= function ( n, type ) {\n\t\t\n\t\tswitch( type ) {\n\t\t\t\n\t\tcase \'char\': case \'uchar\': case \'short\': case \'ushort\': case \'int\': case \'uint\':\n\t\tcase \'int8\': case \'uint8\': case \'int16\': case \'uint16\': case \'int32\': case \'uint32\':\n\n\t\t\treturn parseInt( n );\n\n\t\tcase \'float\': case \'double\': case \'float32\': case \'float64\':\n\n\t\t\treturn parseFloat( n );\n\t\t\t\n\t\t}\n\t\t\n\t},\n\n\tPLY.prototype.parseASCIIElement= function ( properties, line ) {\n\n\t\tvalues = line.split( /\\s+/ );\n\t\t\n\t\tvar element = Object();\n\t\t\n\t\tfor ( var i = 0; i < properties.length; i ++ ) {\n\t\t\t\n\t\t\tif ( properties[i].type === "list" ) {\n\t\t\t\t\n\t\t\t\tvar list = [];\n\t\t\t\tvar n = this.parseASCIINumber( values.shift(), properties[i].countType );\n\n\t\t\t\tfor ( j = 0; j < n; j ++ ) {\n\t\t\t\t\t\n\t\t\t\t\tlist.push( this.parseASCIINumber( values.shift(), properties[i].itemType ) );\n\t\t\t\t\t\n\t\t\t\t}\n\t\t\t\t\n\t\t\t\telement[ properties[i].name ] = list;\n\t\t\t\t\n\t\t\t} else {\n\t\t\t\t\n\t\t\t\telement[ properties[i].name ] = this.parseASCIINumber( values.shift(), properties[i].type );\n\t\t\t\t\n\t\t\t}\n\t\t\t\n\t\t}\n\t\t\n\t\treturn element;\n\t\t\n\t},\n\n\tPLY.prototype.parseASCII= function ( data ) {\n\n\t\t// PLY ascii format specification, as per http://en.wikipedia.org/wiki/PLY_(file_format)\n\n    var geometry = {};\n\t\tvar result;\n\n\t\tvar header = this.parseHeader( data );\n\n\t\tvar patternBody = /end_header\\n([\\s\\S]*)$/;\n\t\tvar body = "";\n\t\tif ( ( result = patternBody.exec( data ) ) != null ) {\n\t\t\tbody = result [ 1 ];\n\t\t}\n\t\t\n\t\tvar lines = body.split( \'\\n\' );\n\t\tvar currentElement = 0;\n\t\tvar currentElementCount = 0;\n\t\t\n\t\t//FIXME:\n\t\t//geometry.useColor = false;\n\t\t\n\t\tfor ( var i = 0; i < lines.length; i ++ ) {\n\n\t\t\tvar line = lines[ i ];\n\t\t\tline = line.trim()\n\t\t\tif ( line === "" ) { continue; }\n\t\t\t\n\t\t\tif ( currentElementCount >= header.elements[currentElement].count ) {\n\n\t\t\t\tcurrentElement++;\n\t\t\t\tcurrentElementCount = 0;\n\n\t\t\t}\n\t\t\t\n\t\t\tvar element = this.parseASCIIElement( header.elements[currentElement].properties, line );\n\t\t\t\n\t\t\tthis.handleElement( geometry, header.elements[currentElement].name, element );\n\t\t\t\n\t\t\tcurrentElementCount++;\n\t\t\t\n\t\t}\n\n\t\t//return this.postProcess( geometry );\n    return this.currentObject;\n\t},\n\n\tpostProcess= function ( geometry ) {\n\t\t\n\t\tif ( geometry.useColor ) {\n\t\t\t\n\t\t\tfor ( var i = 0; i < geometry.faces.length; i ++ ) {\n\t\t\t\t\n\t\t\t\tgeometry.faces[i].vertexColors = [\n\t\t\t\t\tgeometry.colors[geometry.faces[i].a],\n\t\t\t\t\tgeometry.colors[geometry.faces[i].b],\n\t\t\t\t\tgeometry.colors[geometry.faces[i].c]\n\t\t\t\t];\n\t\t\t\t\n\t\t\t}\n\t\t\t\n\t\t\tgeometry.elementsNeedUpdate = true;\n\t\t\t\n\t\t}\n\t\treturn geometry;\n\t};\n\n\tPLY.prototype.handleElement= function ( geometry, elementName, element ) {\n\t\t\n\t\tif ( elementName === "vertex" ) {\n\t\t  this.currentObject._attributes["position"].push( element.x, element.y, element.z );\n\t\t  \n\t\t  if ( \'red\' in element && \'green\' in element && \'blue\' in element ) {\n\t\t      //console.log("colors");\n\t\t\t\t  this.currentObject._attributes["color"].push( element.red, element.blue, element.green );\n\t\t  }\n\t  }\n\t\telse if ( elementName === "face" ) {\n\t\t\t  //console.log("face");\n\t\t\t  this.currentObject.faceCount +=1 ;\n        this.currentObject._attributes["indices"].push( element.vertex_indices[0], element.vertex_indices[1], element.vertex_indices[2] );\n      }\n\t\t\t\n\n\t\t\n\t\t/*if ( elementName === "vertex" ) {\n\n\t\t\tgeometry.vertices.push(\n\t\t\t\tnew THREE.Vector3( element.x, element.y, element.z )\n\t\t\t);\n\t\t\t\n\t\t\tif ( \'red\' in element && \'green\' in element && \'blue\' in element ) {\n\t\t\t\t\n\t\t\t\tgeometry.useColor = true;\n\t\t\t\t\n\t\t\t\tcolor = new THREE.Color();\n\t\t\t\tcolor.setRGB( element.red / 255.0, element.green / 255.0, element.blue / 255.0 );\n\t\t\t\tgeometry.colors.push( color );\n\t\t\t\t\n\t\t\t}\n\n\t\t} else if ( elementName === "face" ) {\n\n\t\t\tgeometry.faces.push(\n\t\t\t\tnew THREE.Face3( element.vertex_indices[0], element.vertex_indices[1], element.vertex_indices[2] )\n\t\t\t);\n\n\t\t}*/\n\t}\n\t\n\t\n\t\t\n\tPLY.prototype.binaryRead= function ( dataview, at, type, little_endian ) {\n\n\t\tswitch( type ) {\n\n\t\t\t// corespondences for non-specific length types here match rply:\n\t\tcase \'int8\':\t\tcase \'char\':\t return [ dataview.getInt8( at ), 1 ];\n\n\t\tcase \'uint8\':\t\tcase \'uchar\':\t return [ dataview.getUint8( at ), 1 ];\n\n\t\tcase \'int16\':\t\tcase \'short\':\t return [ dataview.getInt16( at, little_endian ), 2 ];\n\n\t\tcase \'uint16\':\tcase \'ushort\': return [ dataview.getUint16( at, little_endian ), 2 ];\n\n\t\tcase \'int32\':\t\tcase \'int\':\t\t return [ dataview.getInt32( at, little_endian ), 4 ];\n\n\t\tcase \'uint32\':\tcase \'uint\':\t return [ dataview.getUint32( at, little_endian ), 4 ];\n\n\t\tcase \'float32\': case \'float\':\t return [ dataview.getFloat32( at, little_endian ), 4 ];\n\n\t\tcase \'float64\': case \'double\': return [ dataview.getFloat64( at, little_endian ), 8 ];\n\t\t\t\n\t\t}\n\t\t\n\t},\n\n\tPLY.prototype.binaryReadElement= function ( dataview, at, properties, little_endian ) {\n\t\t\n\t\tvar element = Object();\n\t\tvar result, read = 0;\n\t\t\n\t\tfor ( var i = 0; i < properties.length; i ++ ) {\n\t\t \n\t\t\tif ( properties[i].type === "list" ) {\n\t\t\t\t\n\t\t\t\tvar list = [];\n\n\t\t\t\tresult = this.binaryRead( dataview, at+read, properties[i].countType, little_endian );\n\t\t\t\tvar n = result[0];\n\t\t\t\tread += result[1];\n\t\t\t\t\n\t\t\t\tfor ( j = 0; j < n; j ++ ) {\n\t\t\t\t\t\n\t\t\t\t\tresult = this.binaryRead( dataview, at+read, properties[i].itemType, little_endian );\n\t\t\t\t\tlist.push( result[0] );\n\t\t\t\t\tread += result[1];\n\t\t\t\t\t\n\t\t\t\t}\n\t\t\t\t\n\t\t\t\telement[ properties[i].name ] = list;\n\t\t\t\t\n\t\t\t} else {\n\t\t\t\t\n\t\t\t\tresult = this.binaryRead( dataview, at+read, properties[i].type, little_endian );\n\t\t\t\telement[ properties[i].name ] = result[0];\n\t\t\t\tread += result[1];\n\t\t\t\t\n\t\t\t}\n\t\t\t\n\t\t}\n\t\t\n\t\treturn [ element, read ];\n\t\t\n\t};\n\n\tPLY.prototype.parseBinary= function ( data ) {\n\n\t\tvar geometry = {};//new THREE.Geometry();\n\n\t\tvar header = this.parseHeader( this.bin2str( data ) );\n\t\tvar little_endian = (header.format === "binary_little_endian");\n\t\tvar body = new DataView( data, header.headerLength );\n\t\tvar result, loc = 0;\n\n\t\tfor ( var currentElement = 0; currentElement < header.elements.length; currentElement ++ ) {\n\t\t\t\n\t\t\tfor ( var currentElementCount = 0; currentElementCount < header.elements[currentElement].count; currentElementCount ++ ) {\n\t\t\t\n\t\t\t\tresult = this.binaryReadElement( body, loc, header.elements[currentElement].properties, little_endian );\n\t\t\t\tloc += result[1];\n\t\t\t\tvar element = result[0];\n\t\t\t\n\t\t\t\tthis.handleElement( geometry, header.elements[currentElement].name, element );\n\t\t\t\n\t\t\t}\n\t\t\t\n\t\t}\n\t\t\n\t\t//return this.postProcess( geometry );\n\t\treturn this.currentObject;\n\t};\n\t\n\t\nmodule.exports = PLY;\n\n},{"composite-detect":1}]},{},[3])'],{type:"text/javascript"})));
	  worker.onmessage = function( event ) {
      if("data" in event.data)
      {
        var data = event.data.data;
        console.log("data recieved in main thread", data);
        var model = self.createModelBuffers( data );
        //onDataLoaded( data );
        deferred.resolve( model );//rootObject );
      }
      else if("progress" in event.data)
      {
        deferred.notify( {"parsing":event.data.progress} )
      }
	  }
	  worker.postMessage( {data:data});
	  
	  Q.catch( deferred.promise, function(){
	    worker.terminate()
	  });
  }
  else
  {
    data = new PLY().getData( data );
    onDataLoaded( data );
    deferred.resolve( rootObject );
  }

  return deferred;
  
};


//TODO: potential candidate for re-use across parsers
PLYParser.prototype.createModelBuffers = function ( modelData ) {
  console.log("creating model buffers",modelData, "faces",modelData.faceCount);

  //TODO: only deal with indices/faces if there are ANY !
  var faces = modelData.faceCount || modelData._attributes.position.length/3;
  var colorSize = 3;

  var vertices = new Float32Array( faces * 3 * 3 );
	//var normals = new Float32Array( faces * 3 * 3 );
	var colors = new Float32Array( faces *3 * colorSize );
	var indices = new Uint32Array( faces * 3  );


  vertices.set( modelData._attributes.position );
	colors.set( modelData._attributes.color );
	indices.set( modelData._attributes.indices );


  var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'color'   , new THREE.BufferAttribute( colors, 3 ) );
  geometry.addAttribute( 'index'   , new THREE.BufferAttribute( indices, 1 ) );

  if(this.recomputeNormals)
  {
    //TODO: only do this, if no normals were specified???
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    geometry.computeVertexNormals();
    geometry.computeFaceNormals();
  }

  var color = this.defaultColor ;
  var material = new this.defaultMaterialType({color:color, specular: 0xffffff, shininess: 10, shading: THREE.FlatShading});
  
  if(modelData._attributes.indices.length > 0)
  {
    var mesh = new THREE.Mesh( geometry, material );
  } 
  else
  {
    var material = new THREE.PointCloudMaterial({ size: 1});
    var mesh = new THREE.PointCloud( geometry, material );
  }
    if(modelData._attributes.color.length>0) material.vertexColors= THREE.VertexColors;

  return mesh
}

/*
	parseBinaryBuffers: function ( data ) {
	
	  var geometry = new THREE.BufferGeometry();

		var header = this.parseHeader( this.bin2str( data ) );
		var little_endian = (header.format === "binary_little_endian");
		var body = new DataView( data, header.headerLength );
		var result, loc = 0;

		for ( var currentElement = 0; currentElement < header.elements.length; currentElement ++ ) {
			
			for ( var currentElementCount = 0; currentElementCount < header.elements[currentElement].count; currentElementCount ++ ) {
			
				result = this.binaryReadElement( body, loc, header.elements[currentElement].properties, little_endian );
				loc += result[1];
				var element = result[0];
			
				//this.handleElement( geometry, header.elements[currentElement].name, element );
			  
			  if ( elementName === "vertex" ) {

			      geometry.vertices.push(
				      new THREE.Vector3( element.x, element.y, element.z )
			      );
			
			      if ( 'red' in element && 'green' in element && 'blue' in element ) {
				
				      geometry.useColor = true;
				
				      color = new THREE.Color();
				      color.setRGB( element.red / 255.0, element.green / 255.0, element.blue / 255.0 );
				      geometry.colors.push( color );
				
			      }

		      } else if ( elementName === "face" ) {

			      geometry.faces.push(
				      new THREE.Face3( element.vertex_indices[0], element.vertex_indices[1], element.vertex_indices[2] )
			      );

		      }
			  
			}
	}
	}

};*/


if (detectEnv.isModule) module.exports = PLYParser;

},{"composite-detect":false,"q":false,"three":false}],"ply-parser":[function(require,module,exports){
module.exports=require('8EUKqG');
},{}]},{},["8EUKqG"])