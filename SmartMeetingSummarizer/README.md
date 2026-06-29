# 📋 Smart Meeting Summarizer

Convert meeting recordings into automatic summaries with AI-powered transcription.

=====================================

## Features

- Automatic Summarization - AI generates 5 key bullet points
- Accurate Transcription - Whisper speech-to-text technology
- Privacy First - Audio processing done locally
- Easy Copy - Copy summary or transcript with one click
- Responsive Design - Works on desktop and mobile

=====================================

## Tech Stack

- Backend: FastAPI
- Speech-to-Text: OpenAI Whisper
- Summarization: Google Gemini API
- Frontend: Vanilla JavaScript

## Prerequisites

- Python 3.8+
- Google API Key

=====================================

## Quick Setup (3 steps)

### 1. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

### 2. Set Your Google API Key

Windows (PowerShell):
```powershell
$env:GOOGLE_API_KEY = "your-api-key-here"
```

Windows (Command Prompt):
```cmd
set GOOGLE_API_KEY=your-api-key-here
```

Linux/Mac:
```bash
export GOOGLE_API_KEY="your-api-key-here"
```

### 3. Run the Application

```bash
python backend/main.py
```

The app will start at: http://127.0.0.1:8000

=====================================

## How to Use

1. Open http://127.0.0.1:8000 in your browser
2. Click the upload box to select an audio file (MP3, WAV, M4A, etc.)
3. Click "Process Audio"
4. Wait for transcription and summarization
5. Copy the summary or transcript as needed

=====================================

## Health Check

Test if the backend is running properly:

```bash
curl http://127.0.0.1:8000/api/health
```

Should return:
```json
{
  "status": "ok",
  "whisper": "loaded",
  "gemini": "ready"
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Whisper not loaded | First run takes time downloading the model (~140MB) |
| No API key error | Make sure GOOGLE_API_KEY environment variable is set |
| Port 8000 already in use | Kill existing process or change port in main.py |
| Audio not detected | Try a clearer audio file with less background noise |

=====================================

## Project Structure

```
Smart Meeting Summarizer/
├── backend/
│   ├── main.py              # FastAPI server
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── index.html           # Web interface
│   └── static/
│       ├── js/app.js        # Frontend logic
│       └── css/style.css    # Styling
└── README.md                # This file
```

=====================================

## Notes

- Whisper downloads on first run (~140MB)
- Summaries generated in Arabic via Gemini API
- Temporary files automatically cleaned up after processing
- Requires internet connection for Gemini API calls

=====================================

Built by Reoof Abahussain ★
