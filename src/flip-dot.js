const fs = require('fs');
const path = require('path');

// Input and output file paths
const inputFilePath = path.join(__dirname, '../data/output.dot');
const outputFilePath = path.join(__dirname, '../data/flipped.dot');

// Function to flip X-coordinates in the .dot file
function flipXCoordinates(inputFile, outputFile) {
    fs.readFile(inputFile, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err.message}`);
            return;
        }

        // Regex to find positions in the format "pos=x,y"
        const posRegex = /pos="([-\d.]+),([-\d.]+)"/g;

        // Replace each "pos" with the X-coordinate flipped
        const flippedData = data.replace(posRegex, (match, x, y) => {
            const flippedX = (-1 * parseFloat(x)).toFixed(2); // Flip the X value
            return `pos="${flippedX},${y}"`; // Keep Y unchanged
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
flipXCoordinates(inputFilePath, outputFilePath);
