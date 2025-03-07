// server.js
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors"; // CORSをインポート
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: "*", // 全てのオリジンを許可
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // 許可するHTTPメソッド
    credentials: true, // クッキーなどの資格情報を含める場合
  })
); // CORSを有効にする
app.use(bodyParser.json());
console.log("Server started");
// const token = import.meta.env.VITE_LINE_ACCESS_TOKEN; // 環境変数からトークンを取得
const token = process.env.VITE_LINE_ACCESS_TOKEN;

app.post("/send-message", async (req, res) => {
  const { lineId, message } = req.body;
  console.log("Received data:", req.body);
  const url = "https://api.line.me/v2/bot/message/push";
  console.log("Using token:", token);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const data = {
    to: lineId,
    messages: [
      {
        type: "text",
        text: message,
      },
    ],
  };

  try {
    await axios.post(url, data, { headers });
    res.status(200).send("Message sent successfully");
  } catch (error) {
    if (error.response) {
      // サーバーがレスポンスを返した場合
      console.error("Error sending message:", error.response.data);
      res.status(500).send(`Failed to send message: ${error.response.data}`);
    } else {
      // サーバーがレスポンスを返さなかった場合
      console.error("Error sending message:", error.message);
      window.alert("Failed to send message", error);
      res.status(500).send("Failed to send message");
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
