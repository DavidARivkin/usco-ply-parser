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
    var worker = new Worker( "./ply-worker.js" );
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
