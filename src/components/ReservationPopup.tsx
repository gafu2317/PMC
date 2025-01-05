import React from "react";
import { useState} from "react";
import { Member, Reservation } from "../types/type";
import { v4 as uuidv4 } from "uuid";
import { weekDays, timeSlots } from "../utils/utils";
import {
  addPresets,
  addReservation,
} from "../firebase/userService";
import PresetPopup from "./PresetPopup";

interface ReservationPopupProps {
  myLineId: string; // lineId
  members: Member[]; // 部員の名前
  selectedHours: boolean[][]; // 選択された時間帯
  onSubmit: (reservations: Reservation[]) => void; // 送信ハンドラ
  onClose: () => void; // 閉じるハンドラ
}

const ReservationPopup: React.FC<ReservationPopupProps> = ({
  myLineId,
  members,
  selectedHours,
  onSubmit,
  onClose,
}) => {
  // studentId
  // const foundMember = members.find((member) => member.lineId === myLineId);
  // const myStudentId: number = foundMember ? foundMember.studentId : -1; // デフォルト値を0に設定

  // 選択されたメンバーを管理
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]); // 選択されたメンバーをMembersの配列で管理
  const handleAddSelectedMembers = (member: Member) => {
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

  //プリセットポップアップの状態
  const [isPresetPopup, setIsPresetPopup] = useState<boolean>(false);

  // プリセットに登録するかどうか
  const [isPreset, setIsPreset] = useState<boolean>(false);
  // ハンドラ
  const handleIsAddPreset = () => {
    setIsPreset((prev) => !prev);
  };

  const handleSubmit = () => {
    // 選択されたメンバーの名前を取得
    const selectedNames = selectedMembers.map((member) => member.name);
    // プリセットに登録する場合
    if (isPreset) {
      // presetsの状態が更新されてからaddPresetsを呼び出す
      const newPreset = selectedMembers.map((member) => member.lineId);
      addPresets(myLineId, newPreset);
    }
    // IDの配列を名前の配列に変換
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
    addReservation(reservations);
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
        {/* 名前を検索する要素 */}
        <input
          type="text"
          placeholder="検索"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="border border-blue-200 rounded p-1 mb-1 w-full"
        />
        {/* 縦スクロース可能なメンバー選択要素 */}
        <div className="border border-blue-200 rounded h-32 overflow-y-auto">
          <ul className="list-disc pl-5">
            {filteredMembers.map((member) => (
              <li
                key={member.lineId}
                className={`py-1 flex items-center rounded-full`}
              >
                <label
                  htmlFor={member.lineId}
                  className="user-select-none cursor-pointer"
                >
                <input
                  type="checkbox"
                  id={member.lineId}
                  checked={selectedMembers.includes(member)}
                  onChange={() => handleAddSelectedMembers(member)}
                  className="mr-2 appearance-none h-3 w-3 border border-blue-200 rounded-full checked:bg-blue-500 checked:border-transparent focus:outline-none"
                />
                  {member.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
        {/* 選択されたメンバーを表示する横スクロール可能な要素 */}
        <div className="overflow-x-auto mt-1 h-16 border border-blue-200 rounded ">
          <span className="text-xs ml-1">選択されたメンバー</span>
          <div className="flex space-x-2">
            {selectedMembers.map((member) => (
              <div key={member.lineId} className="whitespace-nowrap">
                {member.name}
              </div>
            ))}
          </div>
        </div>
        {/* プリセットに登録するかどうかのチェックボックス要素 */}
        <div>
          <input
            type="checkbox"
            id="preset"
            name="preset"
            onChange={() => handleIsAddPreset()}
          />
          <label htmlFor="preset" className="ml-1">
            今回のメンバーをプリセットに登録する
          </label>
        </div>
        {/* ボタン要素 */}
        <div className="flex justify-between mt-4">
          <button
            className="p-2 text-black rounded-full w-20 bg-gradient-to-b from-gray-300 to-gray-400"
            onClick={onClose}
          >
            閉じる
          </button>
          <button className=" p-2 bg-gradient-to-b from-sky-400 to-sky-700  text-white rounded-full w-30">
            <span onClick={() => setIsPresetPopup(true)}>プリセット</span>
          </button>
          {isPresetPopup && (
            <PresetPopup
              myLineId={myLineId}
              members={members}
              onClose={() => setIsPresetPopup(false)}
              setSelectedMembers={setSelectedMembers}
            />
          )}
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
