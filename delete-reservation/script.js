//グローバル変数
let data; //スプレッドシートのデータ
let LineId; //LineId
//ページが読み込まれたときのイベントリスナー
document.addEventListener("DOMContentLoaded", async function () {
  // ローディングメッセージを表示
  const loadingMessage = document.getElementById("loadingMessage");
  loadingMessage.style.display = "block"; // メッセージを表示
  await init();
  const liffId = "2006484950-vkz1MmLe"; // LIFF IDをここに入力
  // initializeLiff(liffId);
  LineId = "Uaad36f829cb1c10a72df296f112a16dd";
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
    submitDeleteReservation();
  });

//liffの初期化
function initializeLiff(liffId) {
  liff
    .init({ liffId })
    .then(() => {
      window.alert("LIFF初期化成功");
      getProfile(); // プロフィールを取得
    })
    .catch((error) => {
      window.alert("LIFF初期化失敗:", error);
    });
}

// ユーザーのプロフィールを取得する関数
function getProfile() {
  window.alert("getProfile実行中", LineId);
  liff
    .getProfile()
    .then((profile) => {
      document.getElementById(
        "userId"
      ).textContent = `ユーザーID: ${profile.userId}`;
      LineId = profile.userId;
      window.alert("lineid取得成功", LineId);
    })
    .catch((error) => {
      window.alert("lineid取得失敗:", error);
    });
}

//initデータを取得する関数
async function init() {
  const URL =
    "https://script.google.com/macros/s/AKfycbzCKMUEE71UKxhZs2S_5_JbqxjbYAbvOIt3AxgVCsbpjahY3W8wPgdoPezP1vfx4vh17Q/exec?function=init";
  try {
    const response = await fetch(URL, {
    });
    const initData = await response.json();
    if (initData.isOk) {
      console.log("init成功", initData);
      // グローバル変数に値を代入
      data = initData.data;
      unlockAfterTimeout();
    } else {
      window.alert("他の人が予約中です。時間を置いてから試してみてください。\n もしずっと発生する場合は管理者に連絡してください。");
      unlockFunction();
      liff.closeWindow();
    }
  } catch (error) {
    window.alert("初期設定でエラーが発生しました: " + error);
  }
}
//自動でgasロックを解除する関数
async function unlockAfterTimeout() {
  const URL =
    "https://script.google.com/macros/s/AKfycbzCKMUEE71UKxhZs2S_5_JbqxjbYAbvOIt3AxgVCsbpjahY3W8wPgdoPezP1vfx4vh17Q/exec?function=unlockAfterTimeout";
  try {
    const response = await fetch(URL, {
      mode: "cors",
    });
    console.log("自動ロック解除");
  } catch (error) {
    window.alert("自動ロック解除でエラーが発生しました: " + error);
  }
}

//予約データを取得してリストに入れる関数
async function getReservations() {
  const names = data.予約データ.名前;
  const dates = data.予約データ.日付;
  const startTimes = data.予約データ.開始時間;
  const endTimes = data.予約データ.終了時間;
  const LineIds = data.個人データ.LINEID;
  const usernames = data.個人データ.名前;
  const deletedBy = data.予約データ.削除;//liffでLINEIDが取得できない場合、削除者ではなく削除済みとなっている
  let loginUserName;
  const selectElement = document.getElementById("reservations"); // セレクトボックスの要素を取得
  const now = new Date();

  if (LineId === undefined) {
    for (let j = 0; j < names.length; j++) {
      // 削除者がいない場合のみ表示
      if (
        deletedBy[j] === null ||
        deletedBy[j] === "" ||
        deletedBy[j] === undefined
      ) {
        // 予約日時をDateオブジェクトに変換
        const formattedStartTime = formatTime(startTimes[j]);
        const reservationDateTime = new Date(
          `${dates[j]}T${formattedStartTime}:00`
        ); // ISOフォーマットに変換
        // 現在の日時が予約日時よりも前であれば表示しない
        if (reservationDateTime > now) {
          const option = document.createElement("option");
          // オプションのテキストを設定（例: 名前 + 日付 + 時間）
          option.textContent = `${names[j]} - ${dates[j]} (${startTimes[j]} - ${endTimes[j]})`;
          option.value = j; // オプションの値を設定（必要に応じて変更）
          selectElement.appendChild(option); // セレクトボックスにオプションを追加
        }
      }
    }
  } else {
    // ログインユーザーの名前を取得
    for (let i = 0; i < LineIds.length; i++) {
      if (LineIds[i] === LineId) {
        loginUserName = usernames[i];
      }
    }

    for (let j = 0; j < names.length; j++) {
      // ログインユーザーの予約のみ表示
      const namesArray = names[j].split(",");
      if (namesArray.includes(loginUserName)) {
        // 削除者がいない場合のみ表示
        if (
          deletedBy[j] === null ||
          deletedBy[j] === "" ||
          deletedBy[j] === undefined
        ) {
          // 予約日時をDateオブジェクトに変換
          const formattedStartTime = formatTime(startTimes[j]);
          const reservationDateTime = new Date(
            `${dates[j]}T${formattedStartTime}:00`
          ); // ISOフォーマットに変換
          // 現在の日時が予約日時よりも前であれば表示しない
          if (reservationDateTime > now) {
            const option = document.createElement("option");
            // オプションのテキストを設定（例: 名前 + 日付 + 時間）
            option.textContent = `${names[j]} - ${dates[j]} (${startTimes[j]} - ${endTimes[j]})`;
            option.value = j + 1; // オプションの値を設定（必要に応じて変更）
            selectElement.appendChild(option); // セレクトボックスにオプションを追加
          }
        }
      }
    }
  }
}

// 時間をHH:mm形式にフォーマットする関数
function formatTime(time) {
  const parts = time.split(":");
  const hour = parts[0].padStart(2, "0"); // 2桁に満たない場合は先頭に0を追加
  const minute = parts[1] ? parts[1] : "00"; // 分がない場合は'00'を設定
  return `${hour}:${minute}`;
}

// 削除する予約を送信する関数
async function submitDeleteReservation() {
  const index = document.getElementById("reservations").value;

  const name = data.予約データ.名前;
  const date = data.予約データ.日付;
  const startTime = data.予約データ.開始時間;
  const endTime = data.予約データ.終了時間;
  const eventId = data.予約データ.カレンダーID;
  const LineIds = data.個人データ.LINEID;
  const usernames = data.個人データ.名前;
  let deletedBy;
  // ログインユーザーの名前を取得
  for (let i = 0; i < LineIds.length; i++) {
    if (LineIds[i] === LineId) {
      deletedBy = usernames[i];
    } else {
      deletedBy = "削除済み";
    }
  }

  //　データをLine送信用に整形
  const message = `予約削除\n${name[index]}\n${date[index]}\n${startTime[index]}\n${endTime[index]}\n${index}`;

  // ローディングメッセージを表示
  const loadingMessage = document.getElementById("loadingMessage");
  loadingMessage.style.display = "block"; // メッセージを表示
  sendToLine(message); //LINEに送信
  sendToGas(index, eventId[index], deletedBy); //gasに送信
  // ローディングメッセージを非表示に
  loadingMessage.style.display = "none";
  unlockFunction();
  liff.closeWindow(); // LIFFウィンドウを閉じる
}

//LINEにメッセージを送信する関数
function sendToLine(text) {
  liff
    .sendMessages([{ type: "text", text: text }])
    .then(function () {
      console.log("Lineに送信成功");
    })
    .catch(function (error) {
      window.alert("Failed to send message " + error);
    });
}

//gasに削除データを送る関数
async function sendToGas(index, eventId, deletedBy) {
  const URL =
    "https://script.google.com/macros/s/AKfycbzCKMUEE71UKxhZs2S_5_JbqxjbYAbvOIt3AxgVCsbpjahY3W8wPgdoPezP1vfx4vh17Q/exec?function=deleteReservationFromSheet";
  const sendData = {
    index: index,
    eventId: eventId,
    deletedBy: deletedBy,
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

