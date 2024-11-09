
//ページが読み込まれたときのイベントリスナー
document.addEventListener("DOMContentLoaded", async function () {
  await test();
});
//テスト
async function test() {
  const URL =
    "https://script.google.com/macros/s/AKfycbzCKMUEE71UKxhZs2S_5_JbqxjbYAbvOIt3AxgVCsbpjahY3W8wPgdoPezP1vfx4vh17Q/exec";
  try {
    const response = await fetch(URL, {
      mode: "cors",
    });
    alert(response);
  } catch (error) {
    alert("でエラーが発生しました: " + error);
  }
}
