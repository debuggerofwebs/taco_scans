const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Fetch chapters dynamically
app.get('/fetch-chapters', (req, res) => {
    const folderPath = path.join(__dirname, 'public', req.query.folder);

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Could not read folder' });
        }

        // Only return folders (chapters)
        const chapters = files.filter(file => fs.statSync(path.join(folderPath, file)).isDirectory());
        res.json(chapters);
    });
});

// Fetch images for a chapter
app.get('/fetch-images', (req, res) => {
    const chapterPath = path.join(__dirname, 'public', req.query.path);

    fs.readdir(chapterPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Could not read folder' });
        }

        // Only return image files (e.g., .jpeg, .jpg)
        const images = files
            .filter(file => /\.(jpeg|jpg|png|gif)$/i.test(file)) // Only image files
            .sort((a, b) => { // Sort the images by filename (so 03.jpeg comes before 04.jpeg)
                const numA = parseInt(a.split('.')[0], 10);  // Get the number from filename (e.g., 03)
                const numB = parseInt(b.split('.')[0], 10);  // Get the number from filename (e.g., 04)
                return numA - numB;  // Compare numbers to sort
            })
            .map(file => `${req.query.path}/${file}`); // Generate file paths

        res.json(images); // Send the list of image paths to the frontend
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});