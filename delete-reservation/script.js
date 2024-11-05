document.addEventListener("DOMContentLoaded", function () {
  const liffId = "2006484950-vkz1MmLe"; // LIFF IDをここに入力
  initializeLiff(liffId);
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
  ).padStart(2, "0")}-${String(today.getDate()+1).padStart(2, "0")}`;
  const formattedNextMonday = `${nextMonday.getFullYear()}-${String(
    nextMonday.getMonth() + 1
  ).padStart(2, "0")}-${String(nextMonday.getDate()).padStart(2, "0")}`;

  // 日付入力フィールドのminとmaxを設定
  const dateInput = document.getElementById("date");
  dateInput.setAttribute("min", formattedToday); // 今日の日付をminに設定
  dateInput.setAttribute("max", formattedNextMonday); // 来週の月曜日をmaxに設定
}

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

    const msg = `予約削除\n${nameTypeValue}\n${name}\n${date}\n${time}`;
    sendText(msg);
  });
