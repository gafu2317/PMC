// api/send-message.js
import axios from "axios";

export default async function handler(req, res) {
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
