# Cal-Hacks-AI - Code with Claude

The best LinkedIn ranked AI coding assistant this school has ever seen! 🚀

## Features

- 🤖 **Claude AI Integration**: Powered by Anthropic's Claude 3 Sonnet
- 💻 **Code Review & Suggestions**: Get expert feedback on your code
- 🎯 **Best Practices**: Learn industry-standard coding practices
- ⚡ **Real-time Responses**: Instant AI-powered coding assistance
- 🌐 **Web Interface**: Beautiful, modern UI for easy interaction

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Cal-Hacks-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Then edit `.env` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

4. **Get your Anthropic API key**
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Sign up or log in
   - Create a new API key
   - Copy it to your `.env` file

## Usage

1. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

2. **Open your browser**
   - Navigate to `http://localhost:3000`
   - You'll see the beautiful Cal-Hacks AI interface!

3. **Ask Claude for help**
   - Paste your code in the text area
   - Or describe what you want to build
   - Click "Ask Claude" and get instant assistance!

## API Endpoints

- `GET /` - Main web interface
- `POST /api/ask-claude` - Send code to Claude for review
- `GET /health` - Health check endpoint

## Example Usage

```javascript
// Send a request to Claude
const response = await fetch('/api/ask-claude', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    code: 'function hello() { console.log("Hello World!"); }' 
  })
});

const result = await response.json();
console.log(result.response);
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **AI**: Anthropic Claude 3 Sonnet
- **Frontend**: HTML, CSS, JavaScript
- **Environment**: dotenv for configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own AI coding assistant!

---

**Made with ❤️ for Cal Hacks**
