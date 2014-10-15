var detectEnv = require("composite-detect");

var PLY = function () {


  var currentObject = {};
  currentObject._attributes =  {};
  currentObject._attributes["position"] = [];
  currentObject._attributes["normal"] = [];
  currentObject._attributes["color"] = [];
  currentObject._attributes["indices"] = [];
  currentObject.faceCount = 0;
  
  this.currentObject = currentObject;

}

PLY.prototype = {
  constructor: PLY
};


PLY.prototype.load = function( data ){

  if ( data instanceof ArrayBuffer ) {

      var isASCII = this.isASCII( data );
      if(isASCII)
      {
        return this.parseASCII( this.bin2str( data ) ) ;
      }
      else
      {
        return( this.parseBinary( data ) );
      }

	} else {
	  return this.parseASCII( data );
	}

}


PLY.prototype.bin2str= function (buf) {

		var array_buffer = new Uint8Array(buf);
		var str = '';
		for(var i = 0; i < buf.byteLength; i++) {
			str += String.fromCharCode(array_buffer[i]); // implicitly assumes little-endian
		}

		return str;

	},

	PLY.prototype.isASCII= function( data ){

		var header = this.parseHeader( this.bin2str( data ) );
		
		return header.format === "ascii";

	},

PLY.prototype.parseHeader= function ( data ) {
		
		var patternHeader = /ply([\s\S]*)end_header\n/;
		var headerText = "";
		if ( ( result = patternHeader.exec( data ) ) != null ) {
			headerText = result [ 1 ];
		}
		
		var header = new Object();
		header.comments = [];
		header.elements = [];
		header.headerLength = result[0].length;
		
		var lines = headerText.split( '\n' );
		var currentElement = undefined;
		var lineType, lineValues;

		function make_ply_element_property(propertValues) {
			
			var property = Object();

			property.type = propertValues[0]
			
			if ( property.type === "list" ) {
				
				property.name = propertValues[3]
				property.countType = propertValues[1]
				property.itemType = propertValues[2]

			} else {

				property.name = propertValues[1]

			}

			return property
			
		}
		
		for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			line = line.trim()
			if ( line === "" ) { continue; }
			lineValues = line.split( /\s+/ );
			lineType = lineValues.shift()
			line = lineValues.join(" ")
			
			switch( lineType ) {
				
			case "format":

				header.format = lineValues[0];
				header.version = lineValues[1];

				break;

			case "comment":

				header.comments.push(line);

				break;

			case "element":

				if ( !(currentElement === undefined) ) {

					header.elements.push(currentElement);

				}

				currentElement = Object();
				currentElement.name = lineValues[0];
				currentElement.count = parseInt( lineValues[1] );
				currentElement.properties = [];

				break;
				
			case "property":

				currentElement.properties.push( make_ply_element_property( lineValues ) );

				break;
				

			default:
				console.log("unhandled", lineType, lineValues);
				//console.log(lineType);

			}

		}
		
		if ( !(currentElement === undefined) ) {

			header.elements.push(currentElement);

		}
		
		return header;
		
	},

	


PLY.prototype.parseASCIINumber= function ( n, type ) {
		
		switch( type ) {
			
		case 'char': case 'uchar': case 'short': case 'ushort': case 'int': case 'uint':
		case 'int8': case 'uint8': case 'int16': case 'uint16': case 'int32': case 'uint32':

			return parseInt( n );

		case 'float': case 'double': case 'float32': case 'float64':

			return parseFloat( n );
			
		}
		
	},

	PLY.prototype.parseASCIIElement= function ( properties, line ) {

		values = line.split( /\s+/ );
		
		var element = Object();
		
		for ( var i = 0; i < properties.length; i ++ ) {
			
			if ( properties[i].type === "list" ) {
				
				var list = [];
				var n = this.parseASCIINumber( values.shift(), properties[i].countType );

				for ( j = 0; j < n; j ++ ) {
					
					list.push( this.parseASCIINumber( values.shift(), properties[i].itemType ) );
					
				}
				
				element[ properties[i].name ] = list;
				
			} else {
				
				element[ properties[i].name ] = this.parseASCIINumber( values.shift(), properties[i].type );
				
			}
			
		}
		
		return element;
		
	},

	PLY.prototype.parseASCII= function ( data ) {

		// PLY ascii format specification, as per http://en.wikipedia.org/wiki/PLY_(file_format)

    var geometry = {};
		var result;

		var header = this.parseHeader( data );

		var patternBody = /end_header\n([\s\S]*)$/;
		var body = "";
		if ( ( result = patternBody.exec( data ) ) != null ) {
			body = result [ 1 ];
		}
		
		var lines = body.split( '\n' );
		var currentElement = 0;
		var currentElementCount = 0;
		
		//FIXME:
		//geometry.useColor = false;
		
		for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			line = line.trim()
			if ( line === "" ) { continue; }
			
			if ( currentElementCount >= header.elements[currentElement].count ) {

				currentElement++;
				currentElementCount = 0;

			}
			
			var element = this.parseASCIIElement( header.elements[currentElement].properties, line );
			
			this.handleElement( geometry, header.elements[currentElement].name, element );
			
			currentElementCount++;
			
		}

		//return this.postProcess( geometry );
    return this.currentObject;
	},

	postProcess= function ( geometry ) {
		
		if ( geometry.useColor ) {
			
			for ( var i = 0; i < geometry.faces.length; i ++ ) {
				
				geometry.faces[i].vertexColors = [
					geometry.colors[geometry.faces[i].a],
					geometry.colors[geometry.faces[i].b],
					geometry.colors[geometry.faces[i].c]
				];
				
			}
			
			geometry.elementsNeedUpdate = true;
			
		}
		return geometry;
	};

	PLY.prototype.handleElement= function ( geometry, elementName, element ) {
		
		if ( elementName === "vertex" ) {
		  this.currentObject._attributes["position"].push( element.x, element.y, element.z );
		  
		  if ( 'red' in element && 'green' in element && 'blue' in element ) {
		      //console.log("colors");
				  this.currentObject._attributes["color"].push( element.red, element.blue, element.green );
		  }
	  }
		else if ( elementName === "face" ) {
			  //console.log("face");
			  this.currentObject.faceCount +=1 ;
        this.currentObject._attributes["indices"].push( element.vertex_indices[0], element.vertex_indices[1], element.vertex_indices[2] );
      }
			

		
		/*if ( elementName === "vertex" ) {

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

		}*/
	}
	
	
		
	PLY.prototype.binaryRead= function ( dataview, at, type, little_endian ) {

		switch( type ) {

			// corespondences for non-specific length types here match rply:
		case 'int8':		case 'char':	 return [ dataview.getInt8( at ), 1 ];

		case 'uint8':		case 'uchar':	 return [ dataview.getUint8( at ), 1 ];

		case 'int16':		case 'short':	 return [ dataview.getInt16( at, little_endian ), 2 ];

		case 'uint16':	case 'ushort': return [ dataview.getUint16( at, little_endian ), 2 ];

		case 'int32':		case 'int':		 return [ dataview.getInt32( at, little_endian ), 4 ];

		case 'uint32':	case 'uint':	 return [ dataview.getUint32( at, little_endian ), 4 ];

		case 'float32': case 'float':	 return [ dataview.getFloat32( at, little_endian ), 4 ];

		case 'float64': case 'double': return [ dataview.getFloat64( at, little_endian ), 8 ];
			
		}
		
	},

	PLY.prototype.binaryReadElement= function ( dataview, at, properties, little_endian ) {
		
		var element = Object();
		var result, read = 0;
		
		for ( var i = 0; i < properties.length; i ++ ) {
		 
			if ( properties[i].type === "list" ) {
				
				var list = [];

				result = this.binaryRead( dataview, at+read, properties[i].countType, little_endian );
				var n = result[0];
				read += result[1];
				
				for ( j = 0; j < n; j ++ ) {
					
					result = this.binaryRead( dataview, at+read, properties[i].itemType, little_endian );
					list.push( result[0] );
					read += result[1];
					
				}
				
				element[ properties[i].name ] = list;
				
			} else {
				
				result = this.binaryRead( dataview, at+read, properties[i].type, little_endian );
				element[ properties[i].name ] = result[0];
				read += result[1];
				
			}
			
		}
		
		return [ element, read ];
		
	};

	PLY.prototype.parseBinary= function ( data ) {

		var geometry = {};//new THREE.Geometry();

		var header = this.parseHeader( this.bin2str( data ) );
		var little_endian = (header.format === "binary_little_endian");
		var body = new DataView( data, header.headerLength );
		var result, loc = 0;

		for ( var currentElement = 0; currentElement < header.elements.length; currentElement ++ ) {
			
			for ( var currentElementCount = 0; currentElementCount < header.elements[currentElement].count; currentElementCount ++ ) {
			
				result = this.binaryReadElement( body, loc, header.elements[currentElement].properties, little_endian );
				loc += result[1];
				var element = result[0];
			
				this.handleElement( geometry, header.elements[currentElement].name, element );
			
			}
			
		}
		
		//return this.postProcess( geometry );
		return this.currentObject;
	};
	
	
module.exports = PLY;
