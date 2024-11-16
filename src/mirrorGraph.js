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

    // Regular expression to find `pos` attributes
    const posRegex = /pos="([^,]+),([^"]+)"/g;

    // Replace positions with mirrored coordinates
    const transformedData = data.replace(posRegex, (match, x, y) => {
        const mirroredX = -parseFloat(x); // Negate x to mirror across the y-axis
        const originalY = parseFloat(y); // Keep y unchanged
        return `pos="${mirroredX},${originalY}"`;
    });

    // Write the mirrored graph to a new file
    fs.writeFile(outputFilePath, transformedData, "utf8", (err) => {
        if (err) {
            console.error("Error writing the mirrored file:", err);
        } else {
            console.log("Graph mirrored across the y-axis saved to:", outputFilePath);
        }
    });
});
