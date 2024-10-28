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

function sendText(text) {
  liff
    .sendMessages([{ type: "text", text: text }])
    .then(function () {
      liff.closeWindow();
    })
    .catch(function (error) {
      window.alert("Failed to send message " + error);
    });
}

document
  .getElementById("reservationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // フォームのデフォルトの送信を防ぐ

    const nameType = document.querySelector('input[name="nameType"]:checked');

    // ラジオボタンのvalueを取得
    const nameTypeValue = nameType ? nameType.value : "";
    const name = document.getElementById("name").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    const msg = `${nameTypeValue}\n${name}\n${date}\n${time}`;
    sendText(msg);
  });

//javascriptから直接gasにデータを送信する場合
// //データ送信
// document
//   .getElementById("reservationForm")
//   .addEventListener("submit", function (event) {
//     event.preventDefault(); // デフォルトのフォーム送信を防ぐ

//     // ユーザープロフィールを取得
//     liff
//       .getProfile()
//       .then((profile) => {
//         const sendData = {
//           nameType: document.querySelector('input[name="nameType"]:checked')
//             .value,
//           userId: profile.userId,
//           name: document.getElementById("name").value,
//           date: document.getElementById("date").value,
//           time: document.getElementById("time").value,
//         };

//         //gasにデータを送信
//         fetch(
//           "https://script.google.com/macros/s/AKfycbzCKMUEE71UKxhZs2S_5_JbqxjbYAbvOIt3AxgVCsbpjahY3W8wPgdoPezP1vfx4vh17Q/exec",
//           {
//             method: "POST",
//             mode: "no-cors",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify(sendData),
//           }
//         )
//           .then((response) => {
//             // レスポンスが成功した場合にのみJSONを解析
//             if (!response.ok) {
//               throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json();
//           })
//           .then((data) => {
//             alert("予約が完了しました");
//             document.getElementById("reservationForm").reset(); // フォームをリセット
//           })
//           .catch((error) => {
//             alert("エラーが発生しました: " + error.message);
//             console.error("Error:", error);
//           });
//       })
//       .catch((err) => {
//         console.error("Error getting profile: ", err);
//       });

//   });
