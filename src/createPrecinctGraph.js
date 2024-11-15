// read graph json file and create precinct graphviz file
const fs = require('fs');

const precincts = JSON.parse(fs.readFileSync('data/precinct_graph.json')).precincts;

// filter out edges with ids not within the 100s
for (const precinct of precincts) {
    precinct.neighbors = precinct.neighbors.filter(neighbor => neighbor >= 100 && neighbor < 200);
}

// node class
// id: precinct id
// name: precinct name
// district: district id
// neighbors: array of neighbor nodes by precinct id

// create graph string for precinct graph
const uniqueDistricts = [...new Set(precincts.map(precinct => precinct.district))];
let graph = 'graph precinct_graph {\n';
graph += 'label="Precinct Graph - Districts: ' + uniqueDistricts.join(', ') + '";\n';
graph += 'labelloc="t";\n';
graph += 'bgcolor="black";\n';
graph += 'node [shape=ellipse, fontcolor="white", color="white", style="filled", fillcolor="gray20"];\n';
graph += 'edge [color="white"];\n';

for (const precinct of precincts.reverse()) {
    graph += `${precinct.id} [label="${precinct.name}\\n${precinct.id}"];\n`;
    for (const neighbor of precinct.neighbors) {
        if (precinct.id < neighbor) { // to avoid duplicate edges
            graph += `${precinct.id} -- ${neighbor};\n`;
        }
    }
}

graph += '}\n';

fs.writeFileSync('data/precinct_graph.dot', graph);
console.log('precinct graph created');
