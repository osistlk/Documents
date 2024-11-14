const fs = require('fs');

// Define the path to the JSON file
const filepath = 'data/fairfax.json';

// Read the JSON file synchronously and parse its content
const file = fs.readFileSync(filepath, 'utf8');
const data = JSON.parse(file);

// Extract and transform the data from the JSON file
let votes = data.breakdownResults.map(result => {
    // Split the precinct name to extract the precinct ID and name
    const precinctNameParts = result.precinct.name[0].text.trim().split('-');
    const precinctId = precinctNameParts.length > 1 ? precinctNameParts[0].trim() : '0';
    const precinctName = precinctNameParts.length > 1 ?
        precinctNameParts[1].trim().split(' ').filter(name => !['(0000)', '(0001)', '(0001,0000)', '(0000,0001)'].includes(name)).join(' ') :
        result.precinct.name[0].text.trim();

    // Extract vote details for each ballot option
    const voteDetails = result.ballotOptions.map(option => ({
        candidate: option.name[0].text,
        party: option.party?.name[0]?.text || 'N/A',
        count: option.voteCount
    }));

    // Return the transformed data for the current precinct
    return {
        precinct: {
            id: precinctId,
            name: precinctName
        },
        votes: voteDetails
    };
});

// Calculate the ratio of Democratic to Republican votes for each precinct
for (let vote of votes) {
    const democraticVotes = vote.votes.find(vote => vote.party === 'Democratic').count;
    const republicanVotes = vote.votes.find(vote => vote.party === 'Republican').count;
    vote.ratio = democraticVotes / republicanVotes;
}

// Sort the votes by the ratio in descending order
votes = votes.sort((a, b) => b.ratio - a.ratio).filter(c => !c.votes.every(vote => vote.count === 0));

const ratioSum = votes.reduce((a, v) => a + v.ratio, 0);
const count = votes.length;
const mean = ratioSum / count;
const max = votes.at(0).ratio;
const min = votes.at(-1).ratio;
const deviationsSum = votes.reduce((a, v) => a + ((v.ratio - mean) ^ 2), 0);
const standardDeviation = Math.sqrt((deviationsSum) / count);

// Output the results
console.log('  --   Statistics  --  ');
console.log(`Count: ${count}`);
console.log(`Sum: ${ratioSum}`);
console.log(`Mean: ${mean}`);
console.log(`Min: ${min}`);
console.log(`Max: ${max}`);
console.log(`Standard Deviation: ${standardDeviation}`);

const falseMin = 1 - min;
const a = falseMin * -1;
const b = 1;
const normals = votes.map(vote => a + (((vote.ratio - min) * (b - a)) / (max - min)));
const hexes = normals.map(normal => (1 - normal) * 255);
const colors = hexes.map(hex => hex < 254 ? `#${Math.round(hex).toString(16).padStart(2, '0')}${Math.round(hex).toString(16).padStart(2, '0')}ff` : `#ff${Math.round(Math.abs(hex)).toString(16).padEnd(2, '0')}${Math.round(Math.abs(hex)).toString(16).padEnd(2, '0')}`);

for(let i = 0; i < votes.length; i++) {
	votes[i].color = colors[i];
}

let heatmap = votes.map(vote => `<div style="background-color: ${vote.color}">${vote.precinct.id}/${vote.precinct.name}/${vote.ratio}</div>`);
fs.writeFileSync('assets/heatmap.html', heatmap.join('\n'));
