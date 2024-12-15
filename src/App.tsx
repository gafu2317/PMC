import React, { useState } from "react";
import Hour from "./hour"; // Hourコンポーネントをインポート
import Popup from "./Popup"; // Popupコンポーネントをインポート

function App() {
  // 今日の日付を取得
  const today = new Date();
  const currentDay = today.getDay(); // 0:日曜日, 1:月曜日, ..., 6:土曜日
  const daysOfWeek = ["月", "火", "水", "木", "金", "土", "日", "月"]; // 曜日の配列

  // 今週の曜日と日付を計算
  const weekDays = Array.from({ length: 8 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - currentDay + index + 1); // 今週の日付を計算

    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`; // MM/DD形式
    return { date: formattedDate };
  });

  const timeSlots = [
    "9:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:30",
  ]; // 時間帯

  // 選択された時間の状態を管理
  const [selectedHours, setSelectedHours] = useState<boolean[][]>(
    Array.from({ length: timeSlots.length }, () =>
      Array(daysOfWeek.length).fill(false)
    )
  );
  // 予約された時間の状態を管理
  const [reservedHours, setReservedHours] = useState<boolean[][]>(
    Array.from({ length: timeSlots.length }, () =>
      Array(daysOfWeek.length).fill(false)
    )
  );
  // ポップアップの表示状態を管理
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleHourClick = (rowIndex: number, colIndex: number) => {
    const newSelectedHours = [...selectedHours];
    newSelectedHours[rowIndex][colIndex] =
      !newSelectedHours[rowIndex][colIndex]; // 選択状態をトグル
    setSelectedHours(newSelectedHours);
  };

  const handleReserve = () => {
    const newReservedHours = [...reservedHours];
    const newSelectedHours = [...selectedHours];

    for (let i = 0; i < timeSlots.length; i++) {
      for (let j = 0; j < daysOfWeek.length; j++) {
        if (newSelectedHours[i][j]) {
          newReservedHours[i][j] = true; // 選択された時間を予約
        }
      }
    }

    setReservedHours(newReservedHours); // 予約状態を更新
    setSelectedHours(
      Array.from({ length: timeSlots.length }, () =>
        Array(daysOfWeek.length).fill(false)
      )
    ); // 選択状態をリセット
    setIsPopupVisible(true); // ポップアップを表示
  };

  const closePopup = () => {
    setIsPopupVisible(false); // ポップアップを非表示
  };

  return (
    <div className="p-12">
      <div className="grid grid-cols-9 gap-2 mb-4">
        {/* 空白のセル */}
        <div className="bg-transparent"></div>
        {/* 曜日と日付を表示 */}
        {weekDays.map((item, index) => (
          <div key={index} className="text-center bg-gray-200 p-1 text-xs">
            {daysOfWeek[index]}
            <br />
            {item.date} {/* 曜日と日付を改行で表示 */}
          </div>
        ))}
        {/* 時間帯と空白のセルを表示 */}
        {timeSlots.map((time, rowIndex) => (
          <React.Fragment key={rowIndex}>
            <div className="bg-gray-100 p-2 text-xs">{time}</div>
            {Array.from({ length: daysOfWeek.length }).map((_, colIndex) => (
              <Hour
                key={colIndex}
                isSelected={selectedHours[rowIndex][colIndex]} // クリックフラグを渡す
                isReserved={reservedHours[rowIndex][colIndex]} // 予約状態を渡す
                onClick={() => handleHourClick(rowIndex, colIndex)} // クリックハンドラを渡す
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-center space-x-2 mt-4">
        <button
          className="p-2 bg-blue-500 text-white rounded"
          onClick={handleReserve}
        >
          予約
        </button>
        <button className="p-2 bg-green-500 text-white rounded">🖊️</button>
      </div>
      {isPopupVisible && (
        <Popup message="予約が完了しました！" onClose={closePopup} /> // ポップアップを表示
      )}
    </div>
  );
}

export default App;
