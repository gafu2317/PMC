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
      getUserProfile();
    })
    .catch((err) => {
      console.log("LIFF Initialization failed ", err);
    });
}


// ユーザーのプロフィールを取得する関数
function getUserProfile() {
  liff.getProfile()
    .then(profile => {
      userId = profile.userId; // userIdを取得
      window.alert("User ID: " + userId);
    })
    .catch((err) => {
      window.alert("Error getting profile: " + err);
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
  const names = data.予約データ.名前;
  const dates = data.予約データ.日付;
  const startTimes = data.予約データ.開始時間;
  const endTimes = data.予約データ.終了時間;
  const userIds = data.LINEIDデータ.LINEID;
  const usernames = data.LINEIDデータ.名前;

  // セレクトボックスの要素を取得
  const selectElement = document.getElementById("reservations");
  // データの長さを取得し、すべてのデータをループ
  for (let i = 0; i < userIds.length; i++) {
    // ログインユーザーの名前を取得
    if (userIds[i] === userId) {
      const loginUserName = usernames[i];
      for (let j = 0; j < names.length; j++) {
        // ログインユーザーの予約のみ表示
        const namesArray = names[j].split(",");
        if (namesArray.includes(loginUserName)) {
          const option = document.createElement("option");
          // オプションのテキストを設定（例: 名前 + 日付 + 時間）
          option.textContent = `${names[j]} - ${dates[j]} (${startTimes[j]} - ${endTimes[j]})`;
          option.value = j; // オプションの値を設定（必要に応じて変更）
          selectElement.appendChild(option); // セレクトボックスにオプションを追加
        }
      }
    }
  }
}

// 予約を送信する関数
async function submitReservation() {
  const index = document.getElementById("reservations").value;

  const name = data.予約データ.名前;
  const date = data.予約データ.日付;
  const startTime = data.予約データ.開始時間;
  const endTime = data.予約データ.終了時間;

  //　データをLine送信用に整形
  const message = `予約削除\n${name[index]}\n${date[index]}\n${startTime[index]}\n${endTime[index]}`;

  // ローディングメッセージを表示
  const loadingMessage = document.getElementById("loadingMessage");
  loadingMessage.style.display = "block"; // メッセージを表示
  sendToLine(message); //LINEに送信
  sendToGas(index, 1, 5); //gasに送信
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

//gasに削除データを送る関数
async function sendToGas(index, startColumn, columns) {
  const URL =
    "https://script.google.com/macros/s/AKfycbzCKMUEE71UKxhZs2S_5_JbqxjbYAbvOIt3AxgVCsbpjahY3W8wPgdoPezP1vfx4vh17Q/exec?function=deleteReservationFromSheet";
  const sendData = {
    index: index,
    startColumn: startColumn,
    columns: columns,
  };
  try {
    const response = await fetch(URL, {
      method: "POST",
      body: JSON.stringify(sendData),
    });
    if (!response.ok) {
      throw new Error("HTTPエラー " + response.status);
    }
    const result = await response.json(); // レスポンスをJSONとして取得
    console.log("gasに送信成功", result); // レスポンスを表示
  } catch (error) {
    window.alert("gas送信でエラーが発生しました: " + error);
  }
}

// カレンダーの予約を削除する関数
