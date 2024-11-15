// Parse ballot data from the JSON file
// Create graph nodes for each precinct
// Create graph edges between neighboring precincts
// Output the graph data in a JSON file

const fs = require('fs');

// Define the path to the JSON file
const filepath = 'data/ballots_by_precinct.json';

// Read the JSON file synchronously and parse its content
const file = fs.readFileSync(filepath, 'utf8');
const data = JSON.parse(file);
