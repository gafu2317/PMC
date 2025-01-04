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
  // 選択されたメンバーを管理
  const [selectedMembers, setSelectedMembers] = useState<Members[]>([]); // 選択されたメンバーをMembersの配列で管理
  const handleCheckboxChange = (member: Members) => {
    setSelectedMembers(
      (prev) =>
        prev.includes(member)
          ? prev.filter((m) => m.lineId !== member.lineId) // lineIdでフィルタリング
          : [...prev, member] // メンバーを追加
    );
  };


  // 入力されたフィルター文字列を管理
  const [filterText, setFilterText] = useState<string>("");
  // フィルタリングされたメンバーを取得
  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleSubmit = () => {
    // IDの配列を名前の配列に変換
    const selectedNames = selectedMembers.map((member) => member.name);
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
            names: selectedNames,
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
      <div className="bg-white p-6 rounded shadow-md w-4/5">
        <h3 className="text-lg font-bold">
          使用する人の名前を選択してください
        </h3>
        {/* <div>//oo日oo時間の予約</div>
        {Array.from({ length: daysOfWeek.length }).map((_, dayIndex) => (
          <div key={dayIndex}>
            {daysOfWeek[dayIndex]}
            {Array.from({ length: timeSlots.length }).map((_, timeIndex) => (
              <div key={timeIndex}>{timeSlots[timeIndex]}</div>
            ))}
          </div>
        ))} */}
        <div>//プリセットを使用する(ポップアップ)</div>
        {/* 名前を検索 */}
        <input
          type="text"
          placeholder="検索"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="border border-blue-200 rounded p-1 mb-1 w-full"
        />
        {/* メンバー選択 */}
        <div className="border border-blue-200 rounded h-32 overflow-y-auto">
          <ul className="list-disc pl-5">
            {filteredMembers.map((member) => (
              <li
                key={member.lineId}
                className={`py-1 flex items-center rounded-full`}
              >
                <input
                  type="checkbox"
                  id={member.lineId}
                  checked={selectedMembers.includes(member)}
                  onChange={() => handleCheckboxChange(member)}
                  className="mr-2 appearance-none h-3 w-3 border border-blue-200 rounded-full checked:bg-blue-500 checked:border-transparent focus:outline-none"
                />
                <label htmlFor={member.lineId} className="cursor-pointer">
                  {member.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
        {/* 選択されたメンバーを表示する横スクロール可能な要素 */}
        <div className="overflow-x-auto m-1 h-16">
          <span className="text-xs">選択されたメンバー</span>
          <div className="flex space-x-2">
            {selectedMembers.map((member) => (
              <div key={member.lineId} className="whitespace-nowrap">
                {member.name}
              </div>
            ))}
          </div>
        </div>
        <div>//今回のメンバーをプリセットに登録</div>

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
            className="p-2 text-black rounded-full w-20 bg-gradient-to-b from-gray-300 to-gray-400"
            onClick={onClose}
          >
            閉じる
          </button>
          <button
            className="p-2 bg-gradient-to-b from-sky-600 to-blue-700  text-white rounded-full w-20"
            onClick={handleSubmit}
          >
            予約する
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationPopup;
