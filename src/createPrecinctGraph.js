// read graph json file and create precinct graphviz file
const fs = require('fs');

const precinctGraph = JSON.parse(fs.readFileSync('data/precinct_graph.json'));

// node class
// id: precinct id
// name: precinct name
// district: district id
// neighbors: array of neighbor nodes by precinct id

// create digraph string for precinct graph
let digraph = 'digraph precinct_graph {\n';
digraph += 'node [shape=ellipse];\n';
digraph += 'edge [color=black];\n';

for (const precinct of precinctGraph) {
    digraph += `${precinct.id} [label="${precinct.name}"];\n`;
    for (const neighbor of precinct.neighbors) {
        digraph += `${precinct.id} -> ${neighbor};\n`;
    }
}

digraph += '}\n';

fs.writeFileSync('data/precinct_graph.dot', digraph);
console.log('precinct graph created');
