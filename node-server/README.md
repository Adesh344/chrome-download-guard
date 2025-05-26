# Chrome Download Malware Scanner

- A real-time malware scanner that automatically scans downloaded files using VirusTotal API and removes malicious files instantly.


## 1. Features

✅ Monitors Chrome downloads
✅ Sends downloaded file paths to a Node.js scanner
✅ Checks VirusTotal for file hash (SHA-256)
✅ Uploads and scans file if not already in VirusTotal
✅ Automatically deletes file if malicious
✅ Handles rate limits (429 errors) from VirusTotal
✅ Supports Free API key usage

## 2. How It Works

Chrome extension monitors download completion events
File path is sent to the Node.js server
Server calculates file SHA256 hash and queries VirusTotal
If file is new, it's uploaded for scanning
Malicious files are automatically deleted from your system


## 3. 📁 Folder Structure

chrome-download-virus-scanner/
├── chrome-extension/
│   ├── manifest.json
│   └── background.js
├── server/
│   ├── index.js
│   ├── virusTotal.js
│   ├── .env
│   └── package.json
└── README.md


## 4. Install Dependencies

npm install express cors axios form-data dotenv


## 5. Set Up the Chrome Extension

- Go to chrome://extensions/

- Enable Developer Mode (top right)

- Click "Load unpacked"

- Select the chrome-extension/ folder

- The extension will now monitor downloads automatically



## 6. Node Backend (virusTotal.js)

- Computes file hash
- Checks VirusTotal for previous scans
- If not found, uploads and polls for results
- If malicious → deletes file
- Handles:

- 404: file not scanned before
- 409: already uploaded
- 429: too many requests (rate limit)



## 7. Important Notes
- VirusTotal free tier has limited scans (~4/min). Avoid rapid downloads.
- Only works on platforms where Chrome's download path is accessible (Windows, macOS, Linux).
- Only scans files downloaded through Chrome (not external download managers).
- Node.js must run with proper file system permissions to delete files.

