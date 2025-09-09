const express = require("express");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const FormData = require("form-data");

const upload = multer({ dest: "uploads/" });
const app = express();

app.use(express.json());

const BOT_TOKEN = "8244783809:AAESM8DUsV9goMRYbGCjZxUtyYkw6UUtP_0";
const CHAT_ID = "5734946501";

app.post("/send-msg", upload.single("photo"), async (req, res) => {
  const { name, time, amount, binanceId } = req.body;

  const textMessage = `Name: ${name}\nTime: ${time}\nAmount: ${amount}\nBinance ID: ${binanceId}`;

  try {
    if (req.file) {
      const form = new FormData();
      form.append("chat_id", CHAT_ID);
      form.append("caption", textMessage);
      form.append("photo", fs.createReadStream(req.file.path));

      const response = await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
        form,
        { headers: form.getHeaders() }
      );

      fs.unlinkSync(req.file.path); // delete temp file
      res.json({ success: true, data: response.data });
    } else {
      const response = await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        { chat_id: CHAT_ID, text: textMessage }
      );
      res.json({ success: true, data: response.data });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
