// liffService.ts
import liff from "@line/liff";
import axios from "axios";

export const initLiff = async (): Promise<string | null> => {
  try {
    await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });

    // URLパラメータの取得
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const redirectPage = urlParams.get("redirect");

    // ログインしているか確認
    if (liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      // ログイン後にリダイレクト処理を行う
      if (redirectPage) {
        // ログイン後のリダイレクト
        window.location.href = `https://pmc-lilac.vercel.app/${redirectPage}`;
      }
      return profile.userId; // これがlineIdです
    } else {
      // クエリパラメータをローカルストレージに保存
      if (queryString) {
        localStorage.setItem("redirectQuery", queryString);
      }
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

