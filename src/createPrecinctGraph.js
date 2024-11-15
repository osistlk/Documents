// read graph json file and create precinct graphviz file
const fs = require('fs');

const precincts = JSON.parse(fs.readFileSync('data/precinct_graph.json'));
const metadata = JSON.parse(fs.readFileSync('data/ballots_by_precinct.json'));

// merge color data from metadata into precincts by precinct id
for (const precinct of precincts) {
    const precinctMetadata = metadata.find(precinctMetadata => precinctMetadata.precinct.id == precinct.id);
    precinct.color = precinctMetadata.color;
}

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
graph += 'fontcolor="black";\n';
graph += 'bgcolor="white";\n';
graph += 'node [shape=ellipse, fontcolor="black", color="black", style="filled", fillcolor="lightgray"];\n';
graph += 'edge [color="black"];\n';

precincts.sort((a, b) => a.id - b.id).reverse();
for (const precinct of precincts) {
    const fillColor = precinct.color || 'gray20';
    graph += `${precinct.id} [label="${precinct.name}\\n${precinct.id}", fillcolor="${fillColor}"];\n`;
    for (const neighbor of precinct.neighbors) {
        if (precinct.id < neighbor) { // to avoid duplicate edges
            graph += `${precinct.id} -- ${neighbor};\n`;
        }
    }
}

graph += '}\n';

fs.writeFileSync('data/precinct_graph.dot', graph);
console.log('precinct graph created');
