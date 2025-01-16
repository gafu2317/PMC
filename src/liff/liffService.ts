// liffService.ts
import liff from "@line/liff";

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

export const testLindId:string = "testLineId";

export const sendMessages = async (message: string) => { 
  try {
    await liff.sendMessages([
      {
        type: "text",
        text: message,
      },
    ]);
  } catch (error) {
    console.error("Failed to send message:", error);
  }
}
