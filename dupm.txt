const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const BOT_TOKEN = "8244783809:AAESM8DUsV9goMRYbGCjZxUtyYkw6UUtP_0";
const CHAT_ID = "5734946501";

app.post("/send-msg", async (req, res) => {
  const { name, time, amount, binanceId } = req.body;

  if (!name || !time || !amount || !binanceId) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  const textMessage = `Name: ${name}\nTime: ${time}\nAmount: ${amount}\nBinance ID: ${binanceId}`;

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      { chat_id: CHAT_ID, text: textMessage }
    );

    res.json({ success: true, data: response.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
