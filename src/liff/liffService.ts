// liffService.ts
import liff from "@line/liff";
import axios from "axios";

// const LINE_ACCESS_TOKEN = import.meta.env.LINE_ACCESS_TOKEN;
const LINE_ACCESS_TOKEN =
  "St81k+VUnbPE23IeeYVJVZIWQm8oTfpVDk6hhIi/cj7yJVHGWHUsApb7pCIQiMAvItrxTpK8wviAvlSx+6fgYT/Q03aOjhlJwl7VbPa4Bzy+pR/6Sv5kkm9ywjyvOFbbE56vo2WHac+g5uFKOpPN4AdB04t89/1O/w1cDnyilFU=";

export const initLiff = async (): Promise<string | null> => {
  try {
    await liff.init({ liffId: "2006484950-WLVJM5vB" });
    if (liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      return profile.userId; // これがlineIdです
    } else {
      return "testLineId";
      liff.login(); // ログインしていない場合はログインを促す
      return null;
    }
  } catch (error) {
    console.error("LIFF initialization failed:", error);
    return null;
  }
};

export const testLindId: string = "testLineId";

export const sendMessages = async (
  lineId: string,
  message: string
): Promise<void> => {
  const url = "https://api.line.me/v2/bot/message/push";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
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
