import axios from "axios";
import cors from "cors";

const corsMiddleware = cors({
  origin: ["http://localhost:5173", "https://gafu2317.github.io", "https://pmc-lilac.vercel.app"],
  methods: ["GET", "OPTIONS"],
});

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
  await runMiddleware(req, res, corsMiddleware);

  if (req.method === "GET") {
    const token = process.env.VITE_LINE_ACCESS_TOKEN;
    
    try {
      const [quotaResponse, consumptionResponse] = await Promise.all([
        axios.get('https://api.line.me/v2/bot/message/quota', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('https://api.line.me/v2/bot/message/quota/consumption', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      res.status(200).json({
        totalQuota: quotaResponse.data.value,
        usedMessages: consumptionResponse.data.totalUsage,
        remainingMessages: quotaResponse.data.value - consumptionResponse.data.totalUsage
      });
    } catch (error) {
      console.error("Error getting message status:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to get message status" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}