const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('./server');  // Ensure this points to the file where your app is defined

describe('PDF Upload and Text Extraction', () => {
    it('should return status 400 if no file is uploaded', async () => {
        const res = await request(app)
            .post('/upload')
            .expect(400);
        expect(res.body.error).toEqual('No file uploaded');
    });

    it('should extract text from uploaded PDF and return it', async () => {
        const res = await request(app)
            .post('/upload')
            .attach('pdfFile', path.join(__dirname, 'C:\Users\LENOVO\Desktop\real-time-pdf-summarizer\backend\Research Interests Statement.pdf'))
            .expect(200);
        expect(res.body.text).toContain('My profound interest in machine learning (ML), artificial intelligence (AI), and their applications in computer vision and robotic perception is driven by a strong foundation in computer technology');
    });
});
