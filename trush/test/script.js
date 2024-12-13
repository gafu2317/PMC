document.querySelector("#withLock").addEventListener("click", function () {
  for (let i = 0; i < 5; i++) {
    incrementWithScriptLock();
  }
});
document.querySelector("#withoutLock").addEventListener("click", function () {
  for (let i = 0; i < 5; i++) {
    incrementWithoutScriptLock();
  }
});


async function incrementWithScriptLock() {
  const URL =
    "https://script.google.com/macros/s/AKfycbzCKMUEE71UKxhZs2S_5_JbqxjbYAbvOIt3AxgVCsbpjahY3W8wPgdoPezP1vfx4vh17Q/exec?function=incrementWithScriptLock";
  try {
    const response = await fetch(URL, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("HTTPエラー " + response.status);
    }
    console.log("ロック");
  } catch (error) {
    window.alert("gas送信でエラーが発生しました: " + error);
  }
}

async function incrementWithoutScriptLock() {
  const URL =
    "https://script.google.com/macros/s/AKfycbzCKMUEE71UKxhZs2S_5_JbqxjbYAbvOIt3AxgVCsbpjahY3W8wPgdoPezP1vfx4vh17Q/exec?function=incrementWithoutScriptLock";
  try {
    const response = await fetch(URL, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("HTTPエラー " + response.status);
    }
    console.log("ロックなし");
  } catch (error) {
    window.alert("gas送信でエラーが発生しました: " + error);
  }
}