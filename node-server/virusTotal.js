const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const FormData = require('form-data');
require('dotenv').config();

const API_KEY = process.env.VT_API_KEY;

function calculateSHA256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function scanFileAndCheck(filePath) {
  let sha256;
  try {
    sha256 = await calculateSHA256(filePath);
  } catch (e) {
    console.error("Failed to calculate hash:", e.message);
    return false;
  }

  try {
    
    const existing = await axios.get(`https://www.virustotal.com/api/v3/files/${sha256}`, {
      headers: { "x-apikey": API_KEY }
    });

    const stats = existing.data.data.attributes.last_analysis_stats;
    return stats.malicious > 0 || stats.suspicious > 0;

  } catch (err) {
    const status = err?.response?.status;

    
    if (status === 404) {
      try {
        const form = new FormData();
        form.append("file", fs.createReadStream(filePath));

        const uploadRes = await axios.post("https://www.virustotal.com/api/v3/files", form, {
          headers: {
            "x-apikey": API_KEY,
            ...form.getHeaders()
          }
        });

        const analysisId = uploadRes.data.data.id;

        for (let i = 0; i < 10; i++) {
          await new Promise(res => setTimeout(res, 4000));

          const res = await axios.get(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
            headers: { "x-apikey": API_KEY }
          });

          const stats = res.data.data.attributes.stats;
          if (stats.malicious > 0 || stats.suspicious > 0) {
            return true;
          }
          
          if (res.data.data.attributes.status === 'completed') break;
        }

        return false;

      } catch (uploadErr) {
        if (uploadErr.response?.status === 429) {
          console.warn(" VirusTotal rate limit hit during upload. Skipping scan.");
        } else {
          console.error(" Upload failed:", uploadErr.message);
        }
        return false;
      }

    } else if (status === 429) {
      console.warn(" VirusTotal API rate limit hit. Skipping scan.");
      return false;
    } else if (status === 409) {
      console.warn(" File already uploaded and awaiting scan. Skipping...");
      return false;
    } else if (status === 403) {
      console.error(" Invalid or revoked API key. Check your .env configuration.");
      return false;
    } else {
      console.error(" Unexpected VirusTotal error:", err.message);
      return false;
    }
  }
}

module.exports = { scanFileAndCheck };
