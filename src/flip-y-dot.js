const fs = require('fs');
const path = require('path');

// Input and output file paths
const inputFilePath = path.join(__dirname, '../data/output.dot');
const outputFilePath = path.join(__dirname, '../data/flipped.dot');

// Function to flip Y-coordinates in the .dot file
function flipYCoordinates(inputFile, outputFile) {
    fs.readFile(inputFile, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err.message}`);
            return;
        }

        // Regex to find positions in the format "pos=x,y"
        const posRegex = /pos="([-\d.]+),([-\d.]+)"/g;

        // Replace each "pos" with the Y-coordinate flipped
        const flippedData = data.replace(posRegex, (match, x, y) => {
            const flippedY = (-1 * parseFloat(y)).toFixed(2); // Flip the Y value
            return `pos="${x},${flippedY}"`; // Keep X unchanged
        });

        // Write the flipped data to the output file
        fs.writeFile(outputFile, flippedData, 'utf8', (err) => {
            if (err) {
                console.error(`Error writing file: ${err.message}`);
            } else {
                console.log(`Flipped .dot file written to: ${outputFile}`);
            }
        });
    });
}

// Run the flipping function
flipYCoordinates(inputFilePath, outputFilePath);
