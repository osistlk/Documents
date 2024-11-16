const fs = require('fs');

function createPrecinctGraph() {
    let graph = 'strict graph G {\n';
    graph += '    layout=sfdp;\n';
    graph += '    beautify=true;\n';
    graph += '    splines=none;\n';
    graph += '    overlap=false;\n';
    graph += '    model=subset;\n';
    graph += '    node [shape=circle, style=filled, color=darkblue, fontname="Arial"];\n';
    graph += '    edge [color="#666666"];\n';
    graph += '    bgcolor="#FFFFED";\n';
    graph += '    smoothing=triangle;\n';

    let precincts = JSON.parse(fs.readFileSync('data/raw_precinct_graph.json'));
    const metadata = JSON.parse(fs.readFileSync('data/ballots_by_precinct.json'));

    // merge metadata from metadata into precincts by precinct id
    for (const precinct of precincts) {
        const precinctMetadata = metadata.find(precinctMetadata => precinctMetadata.precinct.id == precinct.id);
        precinct.color = precinctMetadata.color;
        precinct.ratio = precinctMetadata.ratio;
        precinct.totalVotes = precinctMetadata.votes.reduce((acc, cur) => acc + cur.count, 0);
    }

    // for every precinct, add a new key alt_color and make it a hex color going from red to blue based on the ratio
    // Account for the fact that one or two precincts have a ratio 2 to 4 times higher than the rest
    const maxRatio = Math.max(...precincts.map(p => p.ratio));
    const minRatio = Math.min(...precincts.map(p => p.ratio));
    const logMaxRatio = Math.log(maxRatio);
    const logMinRatio = Math.log(minRatio);

    precincts = precincts.map(precinct => {
        const logRatio = Math.log(precinct.ratio);
        const normalizedRatio = (logRatio - logMinRatio) / (logMaxRatio - logMinRatio); // Normalize log ratio to be between 0 and 1
        const red = Math.min(255, 255 * (1 - normalizedRatio));
        const blue = Math.min(255, 255 * normalizedRatio);
        const redComponent = Math.round(red).toString(16).padStart(2, '0');
        const blueComponent = Math.round(blue).toString(16).padStart(2, '0');
        precinct.alt_color = `#${redComponent}00${blueComponent}`;
        return precinct;
    });

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

    // node class
    // id: precinct id
    // name: precinct name
    // district: district id
    // neighbors: array of neighbor nodes by precinct id

    // create graph string for precinct graph
    const uniqueDistricts = [...new Set(precincts.map(precinct => precinct.district))];
    graph += 'label="Precinct Graph - Districts: ' + uniqueDistricts.join(', ') + '";\n';
    graph += 'labelloc="t";\n';

    // bucket precincts by district
    const precinctsByDistrict = {};
    for (const precinct of precincts) {
        if (!precinctsByDistrict[precinct.district]) {
            precinctsByDistrict[precinct.district] = [];
        }
        precinctsByDistrict[precinct.district].push(precinct);
    }

    const maxVotes = Math.max(...precincts.map(p => p.totalVotes));
    const minVotes = Math.min(...precincts.map(p => p.totalVotes));
    for (const district in precinctsByDistrict) {
        const sanitizedDistrict = district.replace(/[^a-zA-Z0-9]/g, '');
        graph += `subgraph ${sanitizedDistrict} {\n`;
        graph += `    label="District ${district}";\n`;
        graph += `    color=blue;\n`;

        for (const precinct of precinctsByDistrict[district]) {
            const fillColor = precinct.alt_color || 'gray20';
            const notBlueHex = fillColor.slice(1, 5);
            const notBlueValue = parseInt(notBlueHex, 16);
            const textColor = notBlueValue < 0x8888 ? 'white' : 'black';
            const size = 0.5 + ((precinct.totalVotes - minVotes) / (maxVotes - minVotes)) * 1.5; // Adjust the multiplier as needed
            graph += `    ${precinct.id} [label="${precinct.id}\\n${precinct.name}\\n${Number(precinct.totalVotes)}\\n${precinct.ratio.toFixed(2)}", fillcolor="${fillColor}", fontcolor="${textColor}", width="${size}", height="${size}"];\n`;
            if (precinct.neighbors.length > 0) {
                graph += `    ${precinct.id} -- {${precinct.neighbors.join(',')}};\n`;
            }
        }

        graph += '}\n';
    }

    graph += '}\n';
    fs.writeFileSync('data/precinct_graph.dot', graph);
}

createPrecinctGraph();
