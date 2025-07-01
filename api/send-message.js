// api/send-message.js
import axios from "axios";
import cors from "cors";

// CORSミドルウェアの初期化
const corsMiddleware = cors({
  origin: ["http://localhost:5173", "https://gafu2317.github.io", "https://pmc-lilac.vercel.app"], // 許可するオリジン
  methods: ["POST", "OPTIONS"], // 許可するメソッド
});

// ミドルウェアを実行するヘルパー関数
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  // CORSミドルウェアを実行
  await runMiddleware(req, res, corsMiddleware);

  if (req.method === "POST") {
    const { lineId, message } = req.body;
    const token = process.env.VITE_LINE_ACCESS_TOKEN; // 環境変数からトークンを取得
    const url = "https://api.line.me/v2/bot/message/push";
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
      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      if (error.response) {
        console.error("Error sending message:", error.response.data);
        res
          .status(500)
          .json({ error: `Failed to send message: ${error.response.data}` });
      } else {
        console.error("Error sending message:", error.message);
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
