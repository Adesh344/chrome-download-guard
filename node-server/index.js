const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { scanFileAndCheck } = require('./virusTotal');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/scan', async (req, res) => {
  const { filePath } = req.body;
  try {
    const isMalicious = await scanFileAndCheck(filePath);
    if (isMalicious) {
      fs.unlinkSync(filePath);
      console.log("Deleted malicious file:", filePath);
    }
    res.send({ success: true, malicious: isMalicious });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(3000, () => console.log("Scanner server running on http://localhost:3000"));
