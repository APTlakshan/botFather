const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Hardcoded token and chat_id for testing
const BOT_TOKEN = "8244783809:AAESM8DUsV9goMRYbGCjZxUtyYkw6UUtP_0";
const CHAT_ID = "5734946501";

// Endpoint to send structured message
app.post("/send-msg", async (req, res) => {
  const { name, time, amount, binanceId, photo } = req.body;

  const textMessage = `Name: ${name}\nTime: ${time}\nAmount: ${amount}\nBinance ID: ${binanceId}`;

  try {
    if (photo) {
      // Send photo via URL
      const response = await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
        {
          chat_id: CHAT_ID,
          photo: photo,
          caption: textMessage
        }
      );
      res.json({ success: true, data: response.data });
    } else {
      // Send only text
      const response = await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          chat_id: CHAT_ID,
          text: textMessage
        }
      );
      res.json({ success: true, data: response.data });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
