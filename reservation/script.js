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

    // ユーザープロフィールを取得
    liff
      .getProfile()
      .then((profile) => {
        const sendData = {
          nameType: document.querySelector('input[name="nameType"]:checked')
            .value,
          userId: profile.userId,
          name: document.getElementById("name").value,
          date: document.getElementById("date").value,
          time: document.getElementById("time").value,
        };

        //gasにデータを送信
        fetch(
          "https://script.google.com/macros/s/AKfycbzCKMUEE71UKxhZs2S_5_JbqxjbYAbvOIt3AxgVCsbpjahY3W8wPgdoPezP1vfx4vh17Q/exec",
          {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(sendData),
          }
        )
          .then((response) => {
            // レスポンスが成功した場合にのみJSONを解析
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            alert("予約が完了しました");
            document.getElementById("reservationForm").reset(); // フォームをリセット
          })
          .catch((error) => {
            alert("エラーが発生しました: " + error.message);
            console.error("Error:", error);
          });
      })
      .catch((err) => {
        console.error("Error getting profile: ", err);
      });

  });
