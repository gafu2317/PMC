// liffService.ts
import liff from "@line/liff";
import axios from "axios";

export const initLiff = async (): Promise<string | null> => {
  try {
    await liff
      .init({ liffId: import.meta.env.VITE_LIFF_ID })
      // .then(() => {
      //   // URLパラメータの取得
      //   const queryString = window.location.search;
      //   const urlParams = new URLSearchParams(queryString);
      //   const redirectPage = urlParams.get("redirect");

      //   // リダイレクト処理
      //   if (redirectPage === "Meikou") {
      //     window.location.href = "https://pmc-lilac.vercel.app/Meikou";
      //   } else if (redirectPage === "Kinjyou") {
      //     window.location.href = "https://pmc-lilac.vercel.app/Kinjyou";
      //   } else {
      //     // デフォルトの処理（必要に応じて）
      //     window.location.href = "https://pmc-lilac.vercel.app/default";
      //   }
      // })
      // .catch((err) => {
      //   console.error("LIFF Initialization failed:", err);
      // });

    if (liff.isLoggedIn()) {
      try {
        const profile = await liff.getProfile();
        return profile.userId; // これがlineIdです
      } catch (error) {
        console.error("Error getting profile:", error);
        return null; // プロフィール取得エラー時はnullを返す
      }
    } else {
      return "Uaad36f829cb1c10a72df296f112a16dd"; //テスト用のlineId
      // ログインを促す
      liff.login();
      return null; // ログインが必要な場合はnullを返す
    }
  } catch (error) {
    console.error("LIFF initialization failed:", error);
    return null; // 初期化エラーの際もnullを返す
  }
};


export const sendMessages = async (
  lineId: string,
  message: string
): Promise<void> => {
  const url = "https://pmc-lilac.vercel.app/api/send-message"; // VercelのURL
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

