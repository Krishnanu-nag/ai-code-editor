require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { exec } = require('child_process');
const fs = require('fs');

const app = express();

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(bodyParser.json());

// Initialize Gemini AI - only need one initialization
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Improved Gemini API endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    
    // Get the model - using correct method name and current model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest", // Updated model name
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.9
      }
    });

    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    
    // Generate content with error handling
    const result = await model.generateContent({
      contents: [{ 
        role: "user",
        parts: [{ text: fullPrompt }]
      }]
    });
    
    const response = await result.response;
    const text = response.text();
    
    res.json({ response: text });
  } catch (error) {
    console.error('Full Gemini API error:', {
      message: error.message,
      status: error.status,
      details: error.errorDetails,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Failed to generate content',
      details: error.message,
      suggestion: 'Check the model name and API key'
    });
  }
});

// Code execution endpoint
app.post('/api/execute', async (req, res) => {
  const { code, language } = req.body;
  
  try {
    let command;
    const filename = `temp_${Date.now()}`;
    
    switch(language) {
      case 'python':
        fs.writeFileSync(`${filename}.py`, code);
        command = `python ${filename}.py`;
        break;
      case 'javascript':
        fs.writeFileSync(`${filename}.js`, code);
        command = `node ${filename}.js`;
        break;
      default:
        return res.status(400).json({ error: 'Unsupported language' });
    }
    
    exec(command, (error, stdout, stderr) => {
      // Clean up
      try {
        fs.unlinkSync(`${filename}.${language === 'python' ? 'py' : 'js'}`);
      } catch (e) {
        console.error('File cleanup error:', e);
      }
      
      if (error) {
        return res.json({ output: stderr });
      }
      res.json({ output: stdout });
    });
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({ 
      error: 'Execution failed',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));