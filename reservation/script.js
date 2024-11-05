
//ページが読み込まれた時の関数
document.addEventListener("DOMContentLoaded", function () {
  const liffId = "2006484950-WLVJM5vB"; // LIFF IDをここに入力
  initializeLiff(liffId);
  alart(fetchPassword());
  setDateLimits();
});

// 日付を設定する関数
function setDateLimits() {
  const today = new Date();
  const nextMonday = new Date(today);
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); //曜日を数字として取得 1:月曜日 〜 7:日曜日(デフォルトは０だけど計算の都合上7にしている)
  nextMonday.setDate(today.getDate() + (8 - dayOfWeek)); // 来週の月曜日を計算

  //月曜の場合分け
  if (dayOfWeek === 1) {
    // 0:00~17:59の場合はdayOfWeekを1にする
    if (today.getHours() < 18) {
      dayOfWeek = 8;
    }
    //18:00~23:59の場合はdayOfWeekを8にする
    if (today.getHours() >= 19) {
      dayOfWeek = 8;
    }
  }

  // 日付をyyyy-MM-dd形式に整形(toISOString()を使うと世界標準寺になってしまうから自分で整形)
  const formattedToday = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const formattedNextMonday = `${nextMonday.getFullYear()}-${String(
    nextMonday.getMonth() + 1
  ).padStart(2, "0")}-${String(nextMonday.getDate()).padStart(2, "0")}`;

  // 日付入力フィールドのminとmaxを設定
  const dateInput = document.getElementById("date");
  dateInput.setAttribute("min", formattedToday); // 今日の日付をminに設定
  dateInput.setAttribute("max", formattedNextMonday); // 来週の月曜日をmaxに設定
}

// パスワード確認ボタンのイベントリスナー
document
  .getElementById("confirmPassword")
  .addEventListener("click", function () {
    const password = document.getElementById("password").value;
    const correctPassword = fetchPassword(); // パスワードを取得
    if (password === correctPassword) {
      // 正しいパスワードをチェック
      document.getElementById("passwordModal").style.display = "none"; // モーダルを隠す
      submitReservation(); // 予約を送信
    } else {
      alert("パスワードが間違っています");
    }
  });

  // キャンセルボタンのイベントリスナー
document.getElementById("cancelPassword").addEventListener("click", function () {
    document.getElementById("passwordModal").style.display = "none"; // モーダルを隠す
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

    const today = new Date();
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    // 18:00〜18:59の時間帯の場合、パスワードモーダルを表示
    if ( currentHour === 18 && currentMinute >= 0) {
      document.getElementById("passwordModal").style.display = "block"; // モーダルを表示
    } else {
      // 通常通り送信
      submitReservation();
    }
  });

// 予約を送信する関数
function submitReservation() {
  const nameType = document.querySelector('input[name="nameType"]:checked');
  const nameTypeValue = nameType ? nameType.value : "";
  const name = document.getElementById("name").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  const msg = `予約\n${nameTypeValue}\n${name}\n${date}\n${time}`;
  sendText(msg);
}

// パスワードを取得する関数
function fetchPassword() {
  const URL ="https://script.google.com/macros/s/AKfycbzCKMUEE71UKxhZs2S_5_JbqxjbYAbvOIt3AxgVCsbpjahY3W8wPgdoPezP1vfx4vh17Q/exec?function=getPassword";
  
  fetch(URL) // ここにApps ScriptのWebアプリURLを入力
    .then((response) => response.text()) // パスワードがテキストとして返されることを想定
    .then((password) => {
      alert(password); // 取得したパスワードを表示
      return password; // 現在のパスワードを変数に保存
    })
    .catch((error) => alert(error));
}


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
