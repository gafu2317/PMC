import React, { useState } from "react";
import Hour from "./Hour";
import ReservationPopup from "./ReservationPopup";
import ReservationDisplay from "./ReservationDisplay";
import EditReservationPopup from "./EditReservationPopup";

function App() {
  const today = new Date();
  const currentDay = today.getDay();
  const daysOfWeek = ["月", "火", "水", "木", "金", "土", "日", "月"];

  const weekDays = Array.from({ length: 8 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - currentDay + index + 1);
    return { date: `${date.getMonth() + 1}/${date.getDate()}` };
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
  ];

  const [selectedHours, setSelectedHours] = useState<boolean[][]>(
    Array.from({ length: timeSlots.length }, () =>
      Array(daysOfWeek.length).fill(false)
    )
  );

  const [reservedNames, setReservedNames] = useState<string[][][][]>(
    Array.from({ length: timeSlots.length }, () =>
      Array.from({ length: daysOfWeek.length }, () => [])
    )
  );

  const [isReservationPopupVisible, setIsReservationPopupVisible] =
    useState(false);

  // 修正: selectedReservationsの型を変更
  const [selectedReservations, setSelectedReservations] = useState<
    { dayIndex: number; timeIndex: number; teamIndex: number }[]
  >([]);

  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);

  const handleHourClick = (rowIndex: number, colIndex: number) => {
    const newSelectedHours = [...selectedHours];
    newSelectedHours[rowIndex][colIndex] =
      !newSelectedHours[rowIndex][colIndex];
    setSelectedHours(newSelectedHours);
  };

  const handleReserve = () => {
    setIsReservationPopupVisible(true);
  };

  const handleNameSubmit = (names: string[]) => {
    const newReservedNames = [...reservedNames];
    const newSelectedHours = [...selectedHours];

    for (let i = 0; i < timeSlots.length; i++) {
      for (let j = 0; j < daysOfWeek.length; j++) {
        if (newSelectedHours[i][j]) {
          newReservedNames[i][j].push(names);
        }
      }
    }

    setReservedNames(newReservedNames);
  };

  // 名前を追加するハンドラー
  const handleNameAdd = (
    dayIndex: number,
    timeIndex: number,
    teamIndex: number,
    namesToAdd: string[]
  ) => {
    const newReservedNames = [...reservedNames];
    console.log("namesToAdd", namesToAdd);
    namesToAdd.forEach((name) => {
      console.log("timeIndex", timeIndex);
      console.log("dayIndex", dayIndex);
      console.log("teamIndex", teamIndex);
      console.log(
        "reservedNames",
        newReservedNames[timeIndex][dayIndex][teamIndex]
      );
      console.log("name", name);
      newReservedNames[timeIndex][dayIndex][teamIndex].push(name);
      console.log(
        "newreservedNames",
        newReservedNames[timeIndex][dayIndex][teamIndex]
      );
    });
    setReservedNames(newReservedNames);
  };

  // 名前を削除するハンドラー
  const handleNameRemove = (
    dayIndex: number,
    timeIndex: number,
    teamIndex: number,
    namesToRemove: string[]
  ) => {
    const namesSet = new Set(namesToRemove);

    // 新しい配列を作成
    const newReservedNames = [...reservedNames];

    // currentTeamをフィルタリングして新しい配列を作成
    newReservedNames[timeIndex][dayIndex][teamIndex] = newReservedNames[
      timeIndex
    ][dayIndex][teamIndex].filter((name) => !namesSet.has(name));
    console.log("newReservedNames", newReservedNames);
    // 状態を更新
    setReservedNames(newReservedNames);
  };

  const handleReservationSelect = (reservation: {
    dayIndex: number;
    timeIndex: number;
    teamIndex: number;
  }) => {
    setSelectedReservations((prev) => {
      const exists = prev.some(
        (r) =>
          r.dayIndex === reservation.dayIndex &&
          r.timeIndex === reservation.timeIndex &&
          r.teamIndex === reservation.teamIndex
      );

      return exists
        ? prev.filter(
            (r) =>
              !(
                r.dayIndex === reservation.dayIndex &&
                r.timeIndex === reservation.timeIndex &&
                r.teamIndex === reservation.teamIndex
              )
          )
        : [...prev, reservation];
    });
  };

  const handleEditPopup = () => {
    if (selectedReservations.length > 0) {
      setIsEditPopupVisible(true);
    }
  };

  return (
    <div className="p-5">
      <div className="grid grid-cols-9 gap-2 mb-4">
        <div className="bg-transparent"></div>
        {weekDays.map((item, index) => (
          <div
            key={index}
            className="text-center bg-gray-200 p-1 text-xs rounded"
          >
            {daysOfWeek[index]}
            <br />
            {item.date}
          </div>
        ))}
        {timeSlots.map((time, rowIndex) => (
          <React.Fragment key={rowIndex}>
            <div className="bg-gray-200 p-2 text-xs rounded">{time}</div>
            {Array.from({ length: daysOfWeek.length }).map((_, colIndex) => (
              <Hour
                key={colIndex}
                isSelected={selectedHours[rowIndex][colIndex]}
                teams={reservedNames[rowIndex][colIndex]}
                onClick={() => handleHourClick(rowIndex, colIndex)}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      {selectedHours.length > 0 && (
        <ReservationDisplay
          weekDays={weekDays}
          reservedNames={reservedNames}
          selectedHours={selectedHours}
          timeSlots={timeSlots}
          selectedReservations={selectedReservations} // 型が一致
          onReservationSelect={handleReservationSelect}
        />
      )}

      <button
        className="fixed bottom-24 right-8 p-2 bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center"
        onClick={handleReserve}
      >
        予約
      </button>

      <button
        className="fixed bottom-8 right-8 p-2 bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center"
        onClick={handleEditPopup}
      >
        編集
      </button>

      {isReservationPopupVisible && (
        <ReservationPopup
          onSubmit={handleNameSubmit}
          onClose={() => setIsReservationPopupVisible(false)}
        />
      )}

      {isEditPopupVisible && (
        <EditReservationPopup
          daysOfWeek={daysOfWeek}
          timeSlots={timeSlots}
          reservedNames={reservedNames}
          selectedReservations={selectedReservations} // 選択された予約情報を渡す
          onClose={() => setIsEditPopupVisible(false)}
          onNameAdd={handleNameAdd}
          onNameRemove={handleNameRemove}
        />
      )}
    </div>
  );
}

export default App;
