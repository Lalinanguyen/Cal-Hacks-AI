const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Store the authorization code temporarily
let authCode = null;

// LinkedIn OAuth callback endpoint
app.get('/linkedin-callback', (req, res) => {
  const { code, state } = req.query;
  
  if (code) {
    authCode = code;
    console.log('✅ LinkedIn authorization code received:', code);
    
    // Send a success response
    res.send(`
      <html>
        <head>
          <title>LinkedIn Authentication Success</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: linear-gradient(135deg, #0077b5, #005582);
              color: white;
            }
            .container {
              background: rgba(255,255,255,0.1);
              padding: 30px;
              border-radius: 10px;
              backdrop-filter: blur(10px);
            }
            .success-icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>LinkedIn Authentication Successful!</h1>
            <p>You can now close this window and return to your app.</p>
            <p>The authorization code has been captured and will be used to complete the authentication.</p>
          </div>
        </body>
      </html>
    `);
  } else {
    res.status(400).send('Authorization code not received');
  }
});

// Endpoint to retrieve the authorization code
app.get('/get-auth-code', (req, res) => {
  if (authCode) {
    const code = authCode;
    authCode = null; // Clear the code after retrieving it
    res.json({ success: true, code });
  } else {
    res.json({ success: false, error: 'No authorization code available' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'LinkedIn callback server is running' });
});

app.listen(port, () => {
  console.log(`🔗 LinkedIn callback server running at http://localhost:${port}`);
  console.log(`📱 Add this URL to your LinkedIn app: http://localhost:${port}/linkedin-callback`);
});

module.exports = app; 