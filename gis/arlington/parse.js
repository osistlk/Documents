const fs = require('fs');

const data = JSON.parse(fs.readFileSync('gis/arlington/data.json', 'utf8'));

const parsedData = data.breakdownResults.map((result) => {
    const name = result.precinct.name[0].text;
    const id = name.split('-')[0].trim();
    const totalVotes = result.voteTotal;
    const dVotes = result.ballotOptions.find(option => option.party.name[0].text === 'Democratic').voteCount;
    return {
        id,
        percentage: dVotes / totalVotes,
    };
});

fs.writeFileSync('gis/arlington/parsed.json', JSON.stringify(parsedData, null, 2));

const keys = Object.keys(parsedData[0]);
header = keys.join(',');
const csv = parsedData.map(row => keys.map(key => row[key]).join(',')).join('\n');
fs.writeFileSync('gis/arlington/parsed.csv', header + '\n' + csv);
