const fs = require('fs');

function createPrecinctGraph() {
    let graph = 'graph G {\n';
    graph += '    layout=neato;\n';
    graph += '    overlap=false;\n';
    graph += '    splines=true;\n';
    graph += '    node [shape=circle, style=filled, color=darkblue, fontname="Arial"];\n';
    graph += '    edge [color=darkgray];\n';
    graph += '    bgcolor="lightgray";\n'; // light gray

    const precincts = JSON.parse(fs.readFileSync('data/raw_precinct_graph.json'));
    const metadata = JSON.parse(fs.readFileSync('data/ballots_by_precinct.json'));

    // merge metadata from metadata into precincts by precinct id
    for (const precinct of precincts) {
        const precinctMetadata = metadata.find(precinctMetadata => precinctMetadata.precinct.id == precinct.id);
        precinct.color = precinctMetadata.color;
        precinct.ratio = precinctMetadata.ratio;
        precinct.totalVotes = precinctMetadata.votes.reduce((acc, cur) => acc + cur.count, 0);
    }

    // create a template precinct graph json file from metadata
    // node class
    // id: precinct id
    // name: precinct name
    // district: district id
    // neighbors: array of neighbor nodes by precinct id
    const template = metadata
        .sort((a, b) => a.precinct.id - b.precinct.id)
        .map(precinctMetadata => {
            return {
                id: Number(precinctMetadata.precinct.id),
                name: precinctMetadata.precinct.name,
                district: null,
                neighbors: []
            };
        });

    // write the template precinct graph json file
    fs.writeFileSync('data/precinct_graph_template.json', JSON.stringify(template, null, 4));

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
    graph += 'label="Precinct Graph - Districts: ' + uniqueDistricts.join(', ') + '";\n';
    graph += 'labelloc="t";\n';

    precincts.sort((a, b) => a.id - b.id).reverse();
    for (const precinct of precincts) {
        const fillColor = precinct.color || 'gray20';
        const notBlueHex = fillColor.slice(1, 5);
        const notBlueValue = parseInt(notBlueHex, 16);
        const textColor = notBlueValue < 0x9999 ? 'white' : 'black';
        const maxVotes = Math.max(...precincts.map(p => p.totalVotes));
        const size = Math.max(0.5, (precinct.totalVotes / maxVotes) * 2); // Adjust the multiplier as needed
        graph += `${precinct.id} [label="${precinct.id}\\n${precinct.name}\\n${Number(precinct.totalVotes)}\\n${precinct.ratio.toFixed(2)}", fillcolor="${fillColor}", fontcolor="${textColor}", width="${size}", height="${size}"];\n`;
        for (const neighbor of precinct.neighbors) {
            if (precinct.id < neighbor) { // to avoid duplicate edges
                graph += `${precinct.id} -- ${neighbor};\n`;
            }
        }
    }

    graph += '}\n';
    fs.writeFileSync('/home/jacquesdaytona/Code/nova-voting-heatmaps/data/precinct_graph.dot', graph);
}

createPrecinctGraph();
