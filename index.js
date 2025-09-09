const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Your bot token from BotFather
const BOT_TOKEN = "8244783809:AAESM8DUsV9goMRYbGCjZxUtyYkw6UUtP_0";

// Your chat_id (from getUpdates)
const CHAT_ID = "5734946501";

// Endpoint to send a message
app.post("/send-msg", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message,
      }
    );
    res.json({ success: true, data: response.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/", (req, res) => {
  res.send("Hello! The Telegram bot server is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
