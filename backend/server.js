const express = require('express');
const fileUpload = require('express-fileupload');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(fileUpload());
app.use(express.json());

// Logger for HTTP requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} request to ${req.url}`);
    next();
});

app.post('/upload', async (req, res) => {
    console.log('Processing file upload request...');
    if (!req.files || !req.files.pdfFile) {
        console.log('Upload error: No file uploaded');
        return res.status(400).send({ error: 'No file uploaded' });
    }

    try {
        console.log('Extracting text from PDF...');
        const text = await extractTextFromPDF(req.files.pdfFile.data);
        console.log('Text extraction successful');
        res.send({ text }); // Send the extracted text back to the frontend
    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).send({ error: 'Failed to process the PDF' });
    }
});

async function extractTextFromPDF(buffer) {
    try {
        console.log('Starting PDF parsing...');
        const data = await pdfParse(buffer);
        console.log('PDF parsing completed.');
        return data.text;
    } catch (error) {
        console.error('Failed to extract text from PDF:', error);
        throw error;
    }
}

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));