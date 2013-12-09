PLYParser = require("../PLYParser");
THREE = require("three");
fs = require("fs");

describe("PLY parser tests", function() {
  var parser = new PLYParser();
  console.log("Parser outputs", parser.outputs);
  
  it("can parse ascii ply files", function() {
    data = fs.readFileSync("specs/data/dolphins.ply",'binary')
    parsedPLY = parser.parse(data);
    expect(parsedPLY instanceof THREE.Geometry).toBe(true);
    expect(parsedPLY.vertices.length).toEqual(855);
  });

  it("can parse ascii ply files with colors", function() {
    data = fs.readFileSync("specs/data/dolphins_colored.ply",'binary')
    parsedPLY = parser.parse(data);
    expect(parsedPLY instanceof THREE.Geometry).toBe(true);
    expect(parsedPLY.vertices.length).toEqual(855);
  });

  it("can parse binary ply files", function() {
    data = fs.readFileSync("specs/data/dolphins_be.ply",'binary')
    parsedPLY = parser.parse(data);
    expect(parsedPLY instanceof THREE.Geometry).toBe(true);
    expect(parsedPLY.vertices.length).toEqual(191);
  });

  it("can parse binary ply files (2)", function() {
    data = fs.readFileSync("specs/data/dolphins_le.ply",'binary')
    parsedPLY = parser.parse(data);
    expect(parsedPLY instanceof THREE.Geometry).toBe(true);
    expect(parsedPLY.vertices.length).toEqual(191);
  });
  
});
