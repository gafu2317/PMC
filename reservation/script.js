//グローバル変数
let data; //スプレッドシートのデータ
let lastRow; //スプレッドシートの最終行
let LineId; //LineId
//ページが読み込まれたときのイベントリスナー
document.addEventListener("DOMContentLoaded", async function () {
  const liffId = "2006484950-WLVJM5vB"; // LIFF IDをここに入力
  initializeLiff(liffId);
  // ローディングメッセージを表示
  const loadingMessage = document.getElementById("loadingMessage");
  loadingMessage.style.display = "block"; // メッセージを表示
  await init();
  await setDateLimits();
  await getNames();
  // ローディングメッセージを非表示に
  loadingMessage.style.display = "none";
});

// 予約フォームの送信ボタンのイベントリスナー
document
  .getElementById("reservationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // フォームのデフォルトの送信を防ぐ

    const today = new Date();
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    // 月曜の18:00〜18:59の時間帯の場合、パスワードモーダルを表示
    if (today.getDay() === 1 && currentHour === 18 && currentMinute >= 0) {
      document.getElementById("passwordModal").style.display = "block"; // モーダルを表示
    } else {
      // 通常通り送信
      submitReservation();
    }
  });

// パスワード確認ボタンのイベントリスナー
document.getElementById("sendPassword").addEventListener("click", function () {
  // ローディングメッセージを表示
  const loadingMessage = document.getElementById("loadingMessage");
  loadingMessage.style.display = "block"; // メッセージを表示

  const password = document.getElementById("password").value;
  const correctPassword = data.パスワード.パスワード; // パスワードを取得

  // ローディングメッセージを非表示に
  loadingMessage.style.display = "none";

  if (password == correctPassword) {
    // 正しいパスワードをチェック
    document.getElementById("passwordModal").style.display = "none"; // モーダルを隠す
    submitReservation(); // 予約を送信
  } else {
    alert("パスワードが間違っています");
  }
});

// キャンセルボタンのイベントリスナー
document
  .getElementById("cancelPassword")
  .addEventListener("click", function () {
    document.getElementById("passwordModal").style.display = "none"; // モーダルを隠す
  });

// パスワード表示ボタンのイベントリスナー
document
  .getElementById("confirmPassword")
  .addEventListener("click", function () {
    const passwordInput = document.getElementById("password");
    const currentType = passwordInput.type; //今のパスワードのタイプを取得
    // typeを切り替える
    if (currentType === "password") {
      passwordInput.type = "text"; // テキストとして表示
      document.getElementById("confirmPassword").innerText = "パスワードを隠す"; // ボタンテキストを変更
    } else {
      passwordInput.type = "password"; // パスワードとして隠す
      document.getElementById("confirmPassword").innerText = "パスワードを表示"; // ボタンテキストを変更
    }
  });

//liffの初期化
function initializeLiff(liffId) {
  liff
    .init({
      liffId: liffId,
    })
    .then(() => {
      initializeApp();
      LineId = profile.userId;
    })
    .catch((err) => {
      console.log("LIFF Initialization failed ", err);
    });
}

// 日付を設定する関数
async function setDateLimits() {
  const today = new Date();
  const nextMonday = new Date(today);

  let dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); //曜日を数字として取得 1:月曜 〜 7:日曜(日曜はデフォルトは0)
  if (dayOfWeek === 1) {
    dayOfWeek = today.getHours() < 18 ? 1 : 8; //月の0:00~17:59はその日だけど18:00~23:59は１週間後まで
  }
  nextMonday.setDate(today.getDate() + (8 - dayOfWeek)); // 次の月曜日を計算

  // 次の月曜日が部会なしの場合、次の次の月曜日まで予約可能
  const isBukaiNashi = await isEventExist(
    formatDate(nextMonday),
    "00:00",
    "23:59",
    "部会無し"
  );
  if (isBukaiNashi) {
    nextMonday.setDate(nextMonday.getDate() + 7);
  }

  //toISOString()を使うと世界標準寺になってしまうから自分で整形する
  const formattedToday = formatDate(today);
  const formattedNextMonday = formatDate(nextMonday);

  // 日付入力フィールドのminとmaxを設定
  const dateInput = document.getElementById("date");
  dateInput.setAttribute("min", formattedToday); // 今日の日付をminに設定
  dateInput.setAttribute("max", formattedNextMonday); // 来週の月曜日をmaxに設定
}

//日付をyyyy-MM-dd形式に整形成形する関数
function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
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

//名前を取得してリストに入れる関数
async function getNames() {
  const names = data.個人データ.名前;
  // セレクトボックスの要素を取得
  const selectElement = document.getElementById("name");
  // 配列の各名前をオプションとして追加
  names.forEach((names) => {
    const option = document.createElement("option");
    option.value = names; // オプションの値を設定
    option.textContent = names; // オプションの表示テキストを設定
    selectElement.appendChild(option); // セレクトボックスにオプションを追加
  });
}

// 予約を送信する関数
async function submitReservation() {
  const nameSelect = document.getElementById("name"); // 名前を取得（選択されたオプションを取得）
  const selectedNames = Array.from(nameSelect.selectedOptions).map(
    (option) => option.value
  );

  const date = document.getElementById("date").value; // 日付を取得
  const startTime = document.getElementById("starttime").value; // 開始時間を取得
  const endTime = document.getElementById("endtime").value; // 終了時間を取得
  const [startTimeHour, startTimeMinutes] = startTime.trim().split(":");
  const [endTimeHour, endTimeMinutes] = endTime.trim().split(":");

  // 開始時間が終了時間よりも後の場合、エラーメッセージを表示
  if (endTimeHour - startTimeHour <= 0) {
    window.alert("終了時間が開始時間よりも前です");
    return;
  }

  // データをオブジェクトにまとめる
  const reservationData = [selectedNames.join(","), date, startTime, endTime];
  //　データをLine送信用に整形
  const message = `予約\n${selectedNames}\n${date}\n${startTime}\n${endTime}`;

  // ローディングメッセージを表示
  const loadingMessage = document.getElementById("loadingMessage");
  loadingMessage.style.display = "block"; // メッセージを表示
  if (!isReservationOverlapping(date, startTime, endTime)) {
    if (!(await isEventExist(date, startTime, endTime, "予約不可"))) {
      sendToLine(message); //LINEに送信
      sendToGas(reservationData, 1, data.予約データ.名前.length + 3); //gasに送信
    } else {
      window.alert("予約不可の日です");
    }
  }
  // ローディングメッセージを非表示に
  loadingMessage.style.display = "none";
  liff.closeWindow(); // LIFFウィンドウを閉じる
}

// GASにデータを送信する関数
async function sendToGas(arrayData, column, lastRow) {
  const URL =
    "https://script.google.com/macros/s/AKfycbzCKMUEE71UKxhZs2S_5_JbqxjbYAbvOIt3AxgVCsbpjahY3W8wPgdoPezP1vfx4vh17Q/exec?function=addReservationToSheet";
  const sendData = {
    arrayData: arrayData,
    column: column,
    lastRow: lastRow,
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

// 予約の重複を確認する関数
function isReservationOverlapping(date, startTime, endTime) {
  // 予約データの例
  const reservationDates = data.予約データ.日付;
  const reservationStartTimes = data.予約データ.開始時間;
  const reservationEndTimes = data.予約データ.終了時間;
  const deletedBy = data.予約データ.削除者;

  for (let i = 0; i < reservationDates.length; i++) {
    if (!deletedBy[i]) {
      // 予約の日付が一致する場合
      if (reservationDates[i].split("T")[0] === date) {
        // 時間の重複をチェック
        const existingStartTime = reservationStartTimes[i];
        const existingEndTime = reservationEndTimes[i];

        // 時間を数値に変換
        const start = convertToMinutes(startTime);
        const end = convertToMinutes(endTime);
        const existingStart = convertToMinutes(existingStartTime);
        const existingEnd = convertToMinutes(existingEndTime);

        // 時間の重複判定
        if (
          (start >= existingStart && start < existingEnd) || // 新しい開始時間が既存の予約の範囲内
          (end > existingStart && end <= existingEnd) || // 新しい終了時間が既存の予約の範囲内
          (start <= existingStart && end >= existingEnd) // 新しい予約が既存の予約を完全に包含
        ) {
          const names = data.予約データ.名前[i];
          window.alert(`${names}と予約が重複しています`);
          return true; // 重複している場合
        }
      }
    }
  }
  console.log("予約は重複していません");
  return false; // 重複していない場合
}

// 時間を分に変換するヘルパー関数
function convertToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes; // 総分数を返す
}

// 時間を分に変換するヘルパー関数
function convertToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes; // 総分数を返す
}

// カレンダーの予約を確認する関数
async function isEventExist(date, startTime, endTime, eventName) {
  const URL = `https://script.google.com/macros/s/AKfycbzCKMUEE71UKxhZs2S_5_JbqxjbYAbvOIt3AxgVCsbpjahY3W8wPgdoPezP1vfx4vh17Q/exec?function=isEventExist&date=${date}&startTime=${startTime}&endTime=${endTime}&eventName=${eventName}`;
  try {
    const response = await fetch(URL, {
      mode: "cors",
    });
    const isEvent = await response.json(); //イベントがあるならtrue
    console.log(
      date +
        "の" +
        startTime +
        "から" +
        endTime +
        "まで" +
        eventName +
        "という予定" +
        (isEvent ? "あり" : "なし")
    );
    return isEvent;
  } catch (error) {
    window.alert("予約確認でエラーが発生しました: " + error);
  }
}

// 検索機能
const searchInput = document.getElementById("searchInput");
const select = document.getElementById("name");

searchInput.addEventListener("input", function () {
  const filter = searchInput.value.toLowerCase(); // 検索文字列を小文字に変換
  const options = select.options; // オプションを取得

  // 現在選択されているオプションを取得
  const selectedValues = Array.from(select.selectedOptions).map(
    (option) => option.value
  );

  // オプションをループして表示/非表示を設定
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const text = option.text.toLowerCase(); // オプションのテキストを小文字に変換

    // 検索文字列に一致する場合は表示、そうでない場合は非表示
    option.style.display = text.includes(filter) ? "" : "none";
  }

  // 再度選択状態を設定
  for (let i = 0; i < options.length; i++) {
    if (selectedValues.includes(options[i].value)) {
      options[i].selected = true; // 選択状態を維持
    }
  }
});

// カレンダーに予約を追加する関数
