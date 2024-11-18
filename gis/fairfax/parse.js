const fs = require('fs');

const data = JSON.parse(fs.readFileSync('gis/fairfax/data.json', 'utf8'));

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

fs.writeFileSync('gis/fairfax/parsed.json', JSON.stringify(parsedData, null, 2));
