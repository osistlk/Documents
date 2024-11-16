const fs = require("fs");
const path = require("path");

// File paths
const inputFilePath = path.join("data", "precinct_graph.dot");
const outputFilePath = path.join("data", "flipped_precinct_graph.dot");

// Read the DOT file
fs.readFile(inputFilePath, "utf8", (err, data) => {
    if (err) {
        console.error("Error reading the file:", err);
        return;
    }

    // Regular expression to find `pos` attributes
    const posRegex = /pos="([^,]+),([^"]+)"/g;

    // Replace positions with the transformed coordinates
    const transformedData = data.replace(posRegex, (match, x, y) => {
        // Parse the original coordinates
        const originalX = parseFloat(x);
        const originalY = parseFloat(y);

        // First flip along y = -x
        const flippedX = -originalY;
        const flippedY = -originalX;

        // Second flip over the Y-axis
        const finalX = -flippedX; // Negate x
        const finalY = flippedY; // Keep y the same

        return `pos="${finalX},${finalY}"`;
    });

    // Write the flipped graph to a new file
    fs.writeFile(outputFilePath, transformedData, "utf8", (err) => {
        if (err) {
            console.error("Error writing the flipped file:", err);
        } else {
            console.log("Double-flipped graph saved to:", outputFilePath);
        }
    });
});
