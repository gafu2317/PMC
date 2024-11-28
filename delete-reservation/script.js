//グローバル変数
let data; //スプレッドシートのデータ
let lastRow; //スプレッドシートの最終行
let userId; //LineId
//ページが読み込まれたときのイベントリスナー
document.addEventListener("DOMContentLoaded", async function () {
  const liffId = "2006484950-WLVJM5vB"; // LIFF IDをここに入力
  initializeLiff(liffId);
  // ローディングメッセージを表示
  const loadingMessage = document.getElementById("loadingMessage");
  loadingMessage.style.display = "block"; // メッセージを表示
  await init();
  await getReservations();
  // ローディングメッセージを非表示に
  loadingMessage.style.display = "none";
});

// 予約フォームの送信ボタンのイベントリスナー
document
  .getElementById("deleteReservationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // フォームのデフォルトの送信を防ぐ

    // 通常通り送信
    submitReservation();
  });

//liffの初期化
function initializeLiff(liffId) {
  liff
    .init({
      liffId: liffId,
    })
    .then(() => {
      initializeApp();
      userId = profile.userId;
      window.alert(userId);
    })
    .catch((err) => {
      console.log("LIFF Initialization failed ", err);
    });
}

//initデータを取得する関数
async function init() {
  const URL =
    "https://script.google.com/macros/s/AKfycbzCKMUEE71UKxhZs2S_5_JbqxjbYAbvOIt3AxgVCsbpjahY3W8wPgdoPezP1vfx4vh17Q/exec?function=init";
  try {
    const response = await fetch(URL, {
      mode: "cors",
    });
    const initData = await response.json();
    console.log("init成功", initData);
    // グローバル変数に値を代入
    data = initData.data;
    lastRow = initData.lastRow;
  } catch (error) {
    // window.alert("初期設定でエラーが発生しました: " + error);
  }
}

//予約データを取得してリストに入れる関数
async function getReservations() {
  const name = data.予約データ.名前;
  const date = data.予約データ.日付;
  const startTime = data.予約データ.開始時間;
  const endTime = data.予約データ.終了時間;
  
  // セレクトボックスの要素を取得
  const selectElement = document.getElementById("reservations");
  // データの長さを取得し、すべてのデータをループ
  for (let i = 0; i < name.length; i++) {
    const option = document.createElement("option");

    // オプションのテキストを設定（例: 名前 + 日付 + 時間）
    option.textContent = `${name[i]} - ${date[i]} (${startTime[i]} - ${endTime[i]})`;
    option.value = name[i]; // オプションの値を設定（必要に応じて変更）

    selectElement.appendChild(option); // セレクトボックスにオプションを追加
  }
}

// 予約を送信する関数
async function submitReservation() {

  const data = "テスト"

  //　データをLine送信用に整形
  const message = `予約\n${selectedNames}\n${date}\n${startTime}\n${endTime}`;

  // ローディングメッセージを表示
  const loadingMessage = document.getElementById("loadingMessage");
  loadingMessage.style.display = "block"; // メッセージを表示
  // sendToLine(message); //LINEに送信
  sendToGas(data); //gasに送信
  // ローディングメッセージを非表示に
  loadingMessage.style.display = "none";
  liff.closeWindow(); // LIFFウィンドウを閉じる
}

//LINEにメッセージを送信する関数
function sendToLine(text) {
  liff
    .sendMessages([{ type: "text", text: text }])
    .then(function () {
      console.log("Lineに送信成功");
      liff.closeWindow();
    })
    .catch(function (error) {
      window.alert("Failed to send message " + error);
    });
}

//gasにデータを送信する関数
function sendToGas(data) {
  console.log("sendToGasは未実装です"+data);
}

// カレンダーの予約を削除する関数
