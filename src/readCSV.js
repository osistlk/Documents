const fs = require('fs');

// Define the path to the JSON file
const filepath = 'data/fairfax.json';

// Read and parse the JSON file
const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

// Extract and transform the data from the JSON file
const votes = data.breakdownResults.map(result => {
    const precinctNameParts = result.precinct.name[0].text.trim().split('-');
    const precinctId = precinctNameParts.length > 1 ? precinctNameParts[0].trim() : '0';
    const precinctName = precinctNameParts.length > 1 ?
        precinctNameParts[1].trim().split(' ').filter(name => !['(0000)', '(0001)', '(0001,0000)', '(0000,0001)'].includes(name)).join(' ') :
        result.precinct.name[0].text.trim();

    const voteDetails = result.ballotOptions.map(option => ({
        candidate: option.name[0].text,
        party: option.party?.name[0]?.text || 'N/A',
        count: option.voteCount
    }));

    return {
        precinct: { id: precinctId, name: precinctName },
        votes: voteDetails
    };
});

// Calculate the ratio of Democratic to Republican votes for each precinct
votes.forEach(vote => {
    const democraticVote = vote.votes.find(vote => vote.party === 'Democratic')?.count || 0;
    const republicanVote = vote.votes.find(vote => vote.party === 'Republican')?.count || 0;

    vote.ratio = republicanVote === 0 ? (democraticVote > 0 ? Infinity : 0) : democraticVote / republicanVote;
});

// Sort the votes by the ratio in descending order and filter out precincts with no votes
const sortedVotes = votes.sort((a, b) => b.ratio - a.ratio).filter(vote => !vote.votes.every(v => v.count === 0));

// Calculate statistics
const ratioSum = sortedVotes.reduce((sum, vote) => sum + vote.ratio, 0);
const count = sortedVotes.length;
const mean = ratioSum / count;
const max = sortedVotes[0].ratio;
const min = sortedVotes[count - 1].ratio;
const deviationsSum = sortedVotes.reduce((sum, vote) => sum + Math.pow(vote.ratio - mean, 2), 0);
const standardDeviation = Math.sqrt(deviationsSum / count);

// Output the results
console.log('  --   Statistics  --  ');
console.log(`Count: ${count}`);
console.log(`Sum: ${ratioSum}`);
console.log(`Mean: ${mean}`);
console.log(`Min: ${min}`);
console.log(`Max: ${max}`);
console.log(`Standard Deviation: ${standardDeviation}`);

// Normalize ratios and generate colors
const falseMin = 1 - min;
const a = falseMin * -1;
const b = 1;
const colors = sortedVotes.map(vote => {
    const normal = a + ((vote.ratio - min) * (b - a)) / (max - min);
    const hex = (1 - normal) * 255;
    return hex < 254 ? `#${Math.round(hex).toString(16).padStart(2, '0')}${Math.round(hex).toString(16).padStart(2, '0')}ff` : `#ff${Math.round(Math.abs(hex)).toString(16).padEnd(2, '0')}${Math.round(Math.abs(hex)).toString(16).padEnd(2, '0')}`;
});

// Assign colors to votes
sortedVotes.forEach((vote, index) => {
    vote.color = colors[index];
});

// Generate heatmap HTML and write to file
const heatmap = sortedVotes.map(vote => `<div style="background-color: ${vote.color}">${vote.precinct.id}/${vote.precinct.name}/${vote.ratio}/${vote.color}</div>`);
fs.writeFileSync('assets/heatmap.html', heatmap.join('\n'));
fs.writeFileSync('data/votes.json', JSON.stringify(votes, null, 2));
