const fs = require("fs");
const path = require("path");

// File paths
const inputFilePath = path.join("data", "flipped_precinct_graph.dot");
const outputFilePath = path.join("data", "mirrored_precinct_graph.dot");

// Read the DOT file
fs.readFile(inputFilePath, "utf8", (err, data) => {
    if (err) {
        console.error("Error reading the file:", err);
        return;
    }

    const posRegex = /pos="([^,]+),([^"]+)"/g;

    // Extract all x-coordinates
    const xCoordinates = [];
    data.replace(posRegex, (_, x) => {
        xCoordinates.push(parseFloat(x));
    });

    // Find min and max x-coordinates
    const xMin = Math.min(...xCoordinates);
    const xMax = Math.max(...xCoordinates);

    // Flip x-coordinates around the midpoint
    const transformedData = data.replace(posRegex, (match, x, y) => {
        const flippedX = xMin + xMax - parseFloat(x);
        return `pos="${flippedX},${y}"`;
    });

    // Write the mirrored graph to a new file
    fs.writeFile(outputFilePath, transformedData, "utf8", (err) => {
        if (err) {
            console.error("Error writing the mirrored file:", err);
        } else {
            console.log("Mirrored graph saved to:", outputFilePath);
        }
    });
});
