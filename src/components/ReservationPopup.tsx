import React from "react";
import { useState } from "react";
import { Members, Reservation } from "../types/type";
import { v4 as uuidv4 } from "uuid";
import { daysOfWeek, weekDays, timeSlots } from "../utils/utils";

interface ReservationPopupProps {
  members: Members[]; // 部員の名前
  selectedHours: boolean[][]; // 選択された時間帯
  onSubmit: (reservations: Reservation[]) => void; // 送信ハンドラ
  onClose: () => void; // 閉じるハンドラ
}

const ReservationPopup: React.FC<ReservationPopupProps> = ({
  members,
  selectedHours,
  onSubmit,
  onClose,
}) => {
  const [names, setNames] = useState<string[]>([""]); // 名前の入力値を管理

  // 名前の入力フィールドの値を更新
  const handleNameChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value && !names.includes(value)) {
      setNames([...names, value]);
    }
  };

  const handleSubmit = () => {
    // 空でない名前だけをフィルタリング
    const filteredNames = names.filter((name) => name);
    const reservations: Reservation[] = [];
    // 予約情報を生成
    for (let dayIndex = 0; dayIndex < selectedHours.length; dayIndex++) {
      for (
        let timeIndex = 0;
        timeIndex < selectedHours[dayIndex].length;
        timeIndex++
      ) {
        if (selectedHours[dayIndex][timeIndex]) {
          const year = weekDays[dayIndex].year;
          const month = weekDays[dayIndex].month;
          const day = weekDays[dayIndex].day;
          const time = timeSlots[timeIndex];
          const [hour, minute] = time.split(":").map(Number);
          reservations.push({
            id: uuidv4(),
            names: filteredNames,
            date: new Date(year, month - 1, day, hour, minute),
            dayIndex,
            timeIndex,
          });
        }
      }
    }
    onSubmit(reservations);
    onClose(); // ポップアップを閉じる
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md">
        <label className="text-lg font-bold">
          使用する人の名前を選択してください
        </label>
        <select id="members" value="{selectedName}" onChange={handleNameChange}>
          {members.map((member) => (
            <option key={member.lineId} value={member.name}>
              {member.name}
            </option>
          ))}
        </select>

        {/* {names.map((name, index) => (
          <input
            key={index}
            type="text"
            value={name}
            onChange={(e) => handleNameChange(index, e.target.value)} // 入力値の更新
            className="border p-2 mt-2 block rounded-lg"
            placeholder="名前を入力"
          />
        ))} */}
        <div className="flex justify-between mt-4">
          <button
            className="p-2 bg-gradient-to-b from-sky-600 to-blue-700  text-white rounded-full w-20"
            onClick={handleSubmit}
          >
            決定
          </button>
          <button
            className="p-2 text-black rounded-full w-20 bg-gradient-to-b from-gray-300 to-gray-400"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationPopup;
