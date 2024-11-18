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

const oldRatios = JSON.parse(fs.readFileSync('../data/votes.json', 'utf8'));

// each dataset is an array of objects with id and ratio, oldRatios id is precinct.id, newRatios id is just id
// compare ratio field and console.log if they are different
const different = results.filter((newRatio) => {
    const oldRatio = oldRatios.find(ratio => ratio.precinct.id == newRatio.id);
    return oldRatio?.ratio !== newRatio?.ratio;
});

const delta = different.map((newRatio) => {
    const oldRatio = oldRatios.find(ratio => ratio.precinct.id == newRatio.id);
    return {
        id: newRatio.id,
        oldRatio: oldRatio?.ratio,
        newRatio: newRatio?.ratio,
        delta: newRatio?.ratio - oldRatio?.ratio
    };
});

fs.writeFileSync('delta.json', JSON.stringify(delta, null, 2));
