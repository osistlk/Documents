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

    // Replace positions with transformed coordinates
    const transformedData = data.replace(posRegex, (match, x, y) => {
        const flippedX = -parseFloat(y); // Flip and negate y -> x
        const flippedY = -parseFloat(x); // Flip and negate x -> y
        return `pos="${flippedX},${flippedY}"`;
    });

    // Write the flipped graph to a new file
    fs.writeFile(outputFilePath, transformedData, "utf8", (err) => {
        if (err) {
            console.error("Error writing the flipped file:", err);
        } else {
            console.log("Flipped graph saved to:", outputFilePath);
        }
    });
});
