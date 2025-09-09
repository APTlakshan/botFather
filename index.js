const express = require("express");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");


const app = express();
app.use(express.json());

const BOT_TOKEN = "8244783809:AAESM8DUsV9goMRYbGCjZxUtyYkw6UUtP_0";
const CHAT_ID = "5734946501";

app.post("/send-msg", async (req, res) => {
  try {
    const form = new FormData();
    form.append("chat_id", CHAT_ID);
    form.append("photo", fs.createReadStream("img.jpg"));

    const photoResponse = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      form,
      { headers: form.getHeaders() }
    );

    res.json({ success: true, photo: photoResponse.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
