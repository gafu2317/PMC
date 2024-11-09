//グローバル変数
let data;
let lastRow;
let sheet;
let calendar;
//ページが読み込まれたときのイベントリスナー
document.addEventListener("DOMContentLoaded", async function () {
  // const liffId = "2006484950-WLVJM5vB"; // LIFF IDをここに入力
  // initializeLiff(liffId);
  // setDateLimits();
  await init();
});

// // 予約フォームの送信ボタンのイベントリスナー
// document
//   .getElementById("reservationForm")
//   .addEventListener("submit", function (event) {
//     event.preventDefault(); // フォームのデフォルトの送信を防ぐ

//     const today = new Date();
//     const currentHour = today.getHours();
//     const currentMinute = today.getMinutes();

//     // 18:00〜18:59の時間帯の場合、パスワードモーダルを表示
//     if (currentHour === 18 && currentMinute >= 0) {
//       document.getElementById("passwordModal").style.display = "block"; // モーダルを表示
//     } else {
//       // 通常通り送信
//       submitReservation();
//     }
//   });

// // パスワード確認ボタンのイベントリスナー
// document
//   .getElementById("confirmPassword").addEventListener("click", async function () {
//     // ローディングメッセージを表示
//     const loadingMessage = document.getElementById("loadingMessage");
//     loadingMessage.style.display = "block"; // メッセージを表示

//     const password = document.getElementById("password").value;
//     const correctPassword = await fetchPassword(); // パスワードを取得

//     // ローディングメッセージを非表示に
//     loadingMessage.style.display = "none";

//     if (password === correctPassword) {
//       // 正しいパスワードをチェック
//       document.getElementById("passwordModal").style.display = "none"; // モーダルを隠す
//       submitReservation(); // 予約を送信
//     } else {
//       alert("パスワードが間違っています");
//     }
//   });

//   // キャンセルボタンのイベントリスナー
// document.getElementById("cancelPassword").addEventListener("click", function () {
//     document.getElementById("passwordModal").style.display = "none"; // モーダルを隠す
// });

// // 日付を設定する関数
// function setDateLimits() {
//   const today = new Date();
//   const nextMonday = new Date(today);
//   const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); //曜日を数字として取得 1:月曜 〜 7:日曜(日曜はデフォルトは0)
//   nextMonday.setDate(today.getDate() + (8 - dayOfWeek)); // 来週の月曜日を計算

//   //月曜日を0:00~17:59と18:00~23:59で場合分け
//   if (dayOfWeek === 1) {
//     if (today.getHours() < 18) {
//       dayOfWeek = 8;
//     }
//     if (today.getHours() >= 19) {
//       dayOfWeek = 8;
//     }
//   }

//   //toISOString()を使うと世界標準寺になってしまうから自分で整形する
//   const formattedToday = formatDate(today);
//   const formattedNextMonday = formatDate(nextMonday);

//   // 日付入力フィールドのminとmaxを設定
//   const dateInput = document.getElementById("date");
//   dateInput.setAttribute("min", formattedToday); // 今日の日付をminに設定
//   dateInput.setAttribute("max", formattedNextMonday); // 来週の月曜日をmaxに設定
// }

// //日付をyyyy-MM-dd形式に整形成形する関数
// function formatDate(date) {
//   return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
// }

// //liffの初期化
// function initializeLiff(liffId) {
//   liff
//     .init({
//       liffId: liffId,
//     })
//     .then(() => {
//       initializeApp();
//     })
//     .catch((err) => {
//       console.log("LIFF Initialization failed ", err);
//     });
// }

// //LINEにメッセージを送信する関数
// function sendText(text) {
//   liff
//     .sendMessages([{ type: "text", text: text }])
//     .then(function () {
//       liff.closeWindow();
//     })
//     .catch(function (error) {
//       window.alert("Failed to send message " + error);
//     });
// }

// // 予約を送信する関数
// function submitReservation() {
//   const nameType = document.querySelector('input[name="nameType"]:checked');
//   const nameTypeValue = nameType ? nameType.value : "";
//   const name = document.getElementById("name").value;
//   const date = document.getElementById("date").value;
//   const time = document.getElementById("time").value;

//   const msg = `予約\n${nameTypeValue}\n${name}\n${date}\n${time}`;
//   sendText(msg);
// }

//initデータを取得する関数
async function init() {
  const URL =
    "https://script.google.com/macros/s/AKfycbzCKMUEE71UKxhZs2S_5_JbqxjbYAbvOIt3AxgVCsbpjahY3W8wPgdoPezP1vfx4vh17Q/exec";
  try {
    const response = await fetch(URL, {
      mode: "cors",
    });
    alert(response);
    // const initData = await response.json();
    // // グローバル変数に値を代入
    // data = initData.data;
    // lastRow = initData.lastRow;
    // sheet = initData.sheet; 
    // calendar = initData.calendar; 
  } catch (error) {
    alert("初期設定でエラーが発生しました: " + error );
  }
}


// // パスワードを取得する関数
// async function fetchPassword() {
//   const URL ="https://script.google.com/macros/s/AKfycbzCKMUEE71UKxhZs2S_5_JbqxjbYAbvOIt3AxgVCsbpjahY3W8wPgdoPezP1vfx4vh17Q/exec?function=getPassword";
  
//   try {
//     const response = await fetch(URL);
//     const password = await response.text();
//     return password;
//   }catch(error){
//     alert("パスワード取得でエラーが発生しました: " + error);
//   }
// }

