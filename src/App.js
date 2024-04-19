import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [file, setFile] = useState(null);
    const [summaryBart, setSummaryBart] = useState("BART summary will appear here.");
    const [summaryT5, setSummaryT5] = useState("T5 summary will appear here.");

    const handleFileChange = (event) => {
        console.log('File selected:', event.target.files[0].name);
        setFile(event.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!file) {
            console.error('No file selected for upload.');
            setSummaryBart("Please select a file to upload.");
            setSummaryT5("Please select a file to upload.");
            return;
        }

        console.log('Preparing to upload file:', file.name);
        const formData = new FormData();
        formData.append('pdfFile', file);

        try {
            console.log('Sending file to server...');
            const { data } = await axios.post('http://localhost:3001/upload', formData);
            console.log('File upload successful, text extracted:', data.text);
            getSummaries(data.text);
        } catch (error) {
            console.error('Error uploading file:', error);
            setSummaryBart("Failed to upload file.");
            setSummaryT5("Failed to upload file.");
        }
    };

    const getSummaries = async (text) => {
        console.log('Requesting summaries for extracted text...');
        try {
            const bartResponse = axios.post('http://localhost:5000/summarize/bart', { text });
            const t5Response = axios.post('http://localhost:5000/summarize/t5', { text });

            const results = await Promise.all([bartResponse, t5Response]);
            setSummaryBart(results[0].data.summary);
            setSummaryT5(results[1].data.summary);
        } catch (error) {
            console.error('Failed to get summaries:', error);
            setSummaryBart("Failed to get BART summary.");
            setSummaryT5("Failed to get T5 summary.");
        }
    }

    return (
        <div className="App">
            <header style={{ background: '#282c34', padding: '10px', color: 'white' }}>
                <h1>Real-Time PDF Summarizer</h1>
            </header>
            <input type="file" onChange={handleFileChange} accept="application/pdf" />
            <button onClick={handleFileUpload}>Upload and Summarize</button>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                <div>
                    <h2>BART Summary:</h2>
                    <p>{summaryBart}</p>
                </div>
                <div>
                    <h2>T5 Summary:</h2>
                    <p>{summaryT5}</p>
                </div>
            </div>
            <footer style={{ background: '#282c34', padding: '10px', color: 'white', position: 'fixed', bottom: 0, width: '100%' }}>
                <p>© 2024 Real-Time Summarization App</p>
            </footer>
        </div>
    );
}

export default App;
