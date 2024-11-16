const fs = require('fs');

function interpolateColor(ratio) {
    // Define start (red), midpoint (white), and end (blue) colors as RGB
    const startColor = [255, 0, 0];   // Red
    const midColor = [255, 255, 255]; // White
    const endColor = [0, 0, 255];     // Blue

    let r, g, b;

    if (ratio < 0.5) {
        // Interpolate between startColor and midColor
        const adjustedRatio = ratio * 2; // Scale to [0, 1] for first half
        r = Math.round(startColor[0] + adjustedRatio * (midColor[0] - startColor[0]));
        g = Math.round(startColor[1] + adjustedRatio * (midColor[1] - startColor[1]));
        b = Math.round(startColor[2] + adjustedRatio * (midColor[2] - startColor[2]));
    } else {
        // Interpolate between midColor and endColor
        const adjustedRatio = (ratio - 0.5) * 2; // Scale to [0, 1] for second half
        r = Math.round(midColor[0] + adjustedRatio * (endColor[0] - midColor[0]));
        g = Math.round(midColor[1] + adjustedRatio * (endColor[1] - midColor[1]));
        b = Math.round(midColor[2] + adjustedRatio * (endColor[2] - midColor[2]));
    }

    // Convert to hex and return
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

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

    // Adjust colors to be light shades of red or blue without visible green tones
    const maxRatio = Math.max(...precincts.map(p => p.ratio));
    const minRatio = -maxRatio; // true min
    precincts = precincts.map(precinct => {
        const sign = Math.sign(precinct.ratio);
        const shiftedRatio = Math.abs(precinct.ratio);
        precinct.alt_ratio = sign * Math.log1p(shiftedRatio);
        precinct.alt_color = (precinct.alt_ratio - minRatio) / (maxRatio - minRatio);
        precinct.heat = interpolateColor(precinct.alt_color);
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
            const fillColor = precinct.heat || 'gray20';
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
