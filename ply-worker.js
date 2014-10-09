var PLY = require("./ply.js");

self.onmessage = function( event ) {
  var data = event.data;
  data = data.data;

  var result = new PLY().load( data );
  
  self.postMessage( {data:result} );
	self.close();

}
