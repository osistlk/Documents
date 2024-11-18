const fs = require('fs');

const data = JSON.parse(fs.readFileSync('ballot-items.json', 'utf8'));

const subset = data.breakdownResults;

const results = subset.map((item) => {
    const name = item.precinct.name[0].text;
    const id = name.split('-')[0].trim();
    const dVotes = item.ballotOptions.find(option => option.party.name[0].text === 'Democratic').voteCount;
    const rVotes = item.ballotOptions.find(option => option.party.name[0].text === 'Republican').voteCount;
    const voteRatio = dVotes / rVotes;
    return {
        id,
        ratio: voteRatio
    };
});

fs.writeFileSync('parsed.json', JSON.stringify(results, null, 2));

const keys = Object.keys(results[0]);
header = keys.join(',');
const csv = results.map(row => keys.map(key => row[key]).join(',')).join('\n');
fs.writeFileSync('parsed.csv', header + '\n' + csv);
