// ...existing code...
const express = require("express");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const cors = require("cors");



const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Telegram BotFather API",
      version: "1.0.0",
      description: "API to send a photo to Telegram bot",
    },
  },
  apis: [__filename],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const BOT_TOKEN = "8244783809:AAESM8DUsV9goMRYbGCjZxUtyYkw6UUtP_0";
const CHAT_ID = "5734946501";

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Backend is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
/**
 * @openapi
 * /api/send-msg:
 *   post:
 *     summary: Send message and photo to Telegram bot
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               binanceId:
 *                 type: string
 *               amount:
 *                 type: number
 *               receipt:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Message and photo sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 telegram:
 *                   type: object
 *       500:
 *         description: Error sending message/photo
 */
const upload = multer({ dest: "uploads/" });
const path = require("path");
app.post("/api/send-msg", upload.single("receipt"), async (req, res) => {
  try {
    const { name, binanceId, amount } = req.body;
    const filePath = req.file ? req.file.path : null;
    if (!name || !binanceId || !amount || !filePath) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const now = new Date();
    const timeString = now.toLocaleString();
    const caption = `Name: ${name}\nTime: ${timeString}\nAmount: ${amount}`;

    const form = new FormData();
    form.append("chat_id", CHAT_ID);
    form.append("caption", caption);

    // Check file type: send as photo if image, else as document (PDF)
    const mimeType = req.file.mimetype;
    let telegramResponse;
    if (mimeType.startsWith("image/")) {
      form.append("photo", fs.createReadStream(filePath));
      telegramResponse = await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
        form,
        { headers: form.getHeaders() }
      );
    } else if (mimeType === "application/pdf") {
      // Rename PDF file using customer details
      const safeName = name.replace(/[^a-zA-Z0-9-_]/g, "_");
      const safeDate = now.toISOString().replace(/[:.]/g, "-");
      const newFilename = `${safeName}_${safeDate}_binance_${binanceId}_amount_${amount}.pdf`;
      const newFilePath = path.join(path.dirname(filePath), newFilename);
      fs.renameSync(filePath, newFilePath);
      form.append("document", fs.createReadStream(newFilePath), { filename: newFilename });
      telegramResponse = await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
        form,
        { headers: form.getHeaders() }
      );
    } else {
      return res.status(400).json({ success: false, error: "Unsupported file type. Please upload an image or PDF." });
    }

    // Send Binance ID as a separate message for easy copying
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: `Binance ID: ${binanceId}`
      }
    );

    res.json({ success: true, telegram: telegramResponse.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
