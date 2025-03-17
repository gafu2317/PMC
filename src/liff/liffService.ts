// liffService.ts
import liff from "@line/liff";
import axios from "axios";

export const initLiff = async (): Promise<string | null> => {
  try {
    await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });

    if (liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      console.log("lineId", profile.userId);
      return profile.userId; // これがlineIdです
    } else {
      return "未ログイン";
      // ログインを促す
      liff.login();
      // ログイン後に再度この関数を呼び出す
      return new Promise((resolve) => {
        liff.ready
          .then(async () => {
            const profile = await liff.getProfile();
            console.log("lineId", profile.userId);
            resolve(profile.userId); // ログイン後のlineIdを返す
          })
          .catch((error) => {
            console.error("Error during LIFF ready:", error);
            resolve(null);
          });
      });
    }
  } catch (error) {
    console.error("LIFF initialization failed:", error);
    return null;
  }
};


export const testLindId: string = "Uaad36f829cb1c10a72df296f112a16dd";

export const sendMessages = async (
  lineId: string,
  message: string
): Promise<void> => {
  const url = "https://pmc-theta.vercel.app/api/send-message"; // VercelのURL
  const data = { lineId, message }; // サーバーに送信するデータ
  console.log("Sending message to:", url, "with data:", data);
  try {
    await axios.post(url, data);
    console.log("通知成功");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      alert("Failed to send message: " + error.message);
      console.error(
        "Failed to send message:",
        error.response?.data || error.message
      );
    } else {
      alert("An unexpected error occurred: " + error);
      console.error("An unexpected error occurred:", error);
    }
  }
};
// const token = import.meta.env.VITE_LINE_ACCESS_TOKEN;
// export const sendMessages = async (
//   lineId: string,
//   message: string
// ): Promise<void> => {
//   const url = "https://api.line.me/v2/bot/message/push";
//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   };
//   const data = {
//     to: lineId,
//     messages: [
//       {
//         type: "text",
//         text: message,
//       },
//     ],
//   };
//   try {
//     await axios.post(url, data, { headers });
//     console.log("通知成功");
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       alert("Failed to send message: " + error.message);
//       console.error(
//         "Failed to send message:",
//         error.response?.data || error.message
//       );
//     } else {
//       alert("An unexpected error occurred: " + error);
//       console.error("An unexpected error occurred:", error);
//     }
//   }
// };
