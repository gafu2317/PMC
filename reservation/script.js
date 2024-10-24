document.addEventListener("DOMContentLoaded", function () {
  const liffId = "2006484950-WLVJM5vB"; // LIFF IDをここに入力
  initializeLiff(liffId);
});

//liffの初期化
function initializeLiff(liffId) {
  liff
    .init({
      liffId: liffId,
    })
    .then(() => {
      initializeApp();
    })
    .catch((err) => {
      console.log("LIFF Initialization failed ", err);
    });
}

//データ送信
document
  .getElementById("reservationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // デフォルトのフォーム送信を防ぐ

    // フォームの入力値を取得
    const nameType = document.querySelector(
      'input[name="nameType"]:checked'
    ).value;


    // ユーザープロフィールを取得
    liff
      .getProfile()
      .then((profile) => {
        const userId = profile.userId; // LINEのユーザーID
      })
      .catch((err) => {
        console.error("Error getting profile: ", err);
      });

    const name = document.getElementById("name").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    //gasにデータを送信
    fetch(
      "https://script.google.com/macros/s/AKfycbzCKMUEE71UKxhZs2S_5_JbqxjbYAbvOIt3AxgVCsbpjahY3W8wPgdoPezP1vfx4vh17Q/exec",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nameType,userId, name, date, time }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        alert("予約が完了しました");
        document.getElementById("reservationForm").reset(); // フォームをリセット
      })
      .catch((error) => {
        alert("エラーが発生しました: " + error);
        console.error("Error:", error);
      });
  });
