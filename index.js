const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const Anthropic = require('@anthropic-ai/sdk');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cal-Hacks AI - Code with Claude</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .code-input { width: 100%; height: 200px; margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; font-family: monospace; }
        .submit-btn { background: #007bff; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        .submit-btn:hover { background: #0056b3; }
        .response { margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 5px; white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Cal-Hacks AI - Code with Claude</h1>
        <p>The best LinkedIn ranked AI coding assistant this school has ever seen!</p>
        
        <textarea id="codeInput" class="code-input" placeholder="Enter your code here or describe what you want to build..."></textarea>
        <button onclick="submitCode()" class="submit-btn">Ask Claude</button>
        
        <div id="response" class="response" style="display: none;"></div>
      </div>

      <script>
        async function submitCode() {
          const code = document.getElementById('codeInput').value;
          const responseDiv = document.getElementById('response');
          
          if (!code.trim()) {
            alert('Please enter some code or a description!');
            return;
          }

          responseDiv.style.display = 'block';
          responseDiv.textContent = '🤔 Claude is thinking...';

          try {
            const response = await fetch('/api/ask-claude', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: code })
            });

            const data = await response.json();
            responseDiv.textContent = data.response;
          } catch (error) {
            responseDiv.textContent = '❌ Error: ' + error.message;
          }
        }
      </script>
    </body>
    </html>
  `);
});

// API endpoint for Claude
app.post('/api/ask-claude', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ 
        error: 'ANTHROPIC_API_KEY not found in environment variables' 
      });
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `You are an expert coding assistant. Please help with the following code or request:

${code}

Please provide:
1. Code review and suggestions
2. Improvements or optimizations
3. Best practices
4. Any relevant explanations

Be helpful, clear, and concise.`
        }
      ]
    });

    res.json({ response: message.content[0].text });
  } catch (error) {
    console.error('Error calling Claude:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Cal-Hacks AI is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Cal-Hacks AI server running on http://localhost:${PORT}`);
  console.log(`📝 Make sure to set your ANTHROPIC_API_KEY in the .env file`);
}); 