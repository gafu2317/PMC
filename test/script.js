
//ページが読み込まれたときのイベントリスナー
document.addEventListener("DOMContentLoaded", async function () {
  console.log("test");
  await test();
});
//テスト
async function test() {
  const URL =
    "https://script.google.com/macros/s/AKfycbw0Vdi6AAYwQUP3BrWQEp1BjZdws31h_b3qkVXoshD6K2koZB01OucY-tx969PAfmSbdw/exec";
  try {
    const response = await fetch(URL,{
    });
    console.log(response.json());
  } catch (error) {
    alert("でエラーが発生しました: " + error);
  }
}
