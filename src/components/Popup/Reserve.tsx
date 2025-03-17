import React from "react";
import { useState } from "react";
import { Member, Reservation } from "../../types/type";
import { v4 as uuidv4 } from "uuid";
import { weekDays, timeSlots, timeSlotsKinjyou } from "../../utils/utils";
import {
  addPresets,
  addReservations,
  addReservationsKinjyou,
} from "../../firebase/userService";
import PresetPopup from "./Preset";
import { MemberList } from "../Forms";
import Swal from "sweetalert2";
import e from "express";

interface ReservationPopupProps {
  myLineId: string; // lineId
  members: Member[]; // 部員の名前
  selectedHours: boolean[][]; // 選択された時間帯
  onClose: () => void; // 閉じるハンドラ
  isKinjyou?: boolean; // 金城かどうか
}

const ReservationPopup: React.FC<ReservationPopupProps> = ({
  myLineId,
  members,
  selectedHours,
  onClose,
  isKinjyou,
}) => {
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
    const myName = members.find((member) => member.lineId === myLineId)?.name;
    if (selectedNames.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "エラー",
        text: "一名以上のメンバーを選択してください",
        confirmButtonText: "OK",
      });
      return;
    }
    if (!myName || !selectedNames.includes(myName)) {
      Swal.fire({
        icon: "warning",
        title: "エラー",
        text: "自分を含めて選択してください",
        confirmButtonText: "OK",
      });
      return;
    }
    // IDの配列を名前の配列に変換
    const reservations: Reservation[] = [];
    const now = new Date();
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59
    );
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
          if (isKinjyou) {
            const time = timeSlotsKinjyou[timeIndex];
            const [hour, minute] = time.split(":").map(Number);
            const date = new Date(year, month - 1, day, hour, minute);

            //過去の予約はできない
            if (date < endOfDay) {
              Swal.fire({
                icon: "warning",
                title: "エラー",
                text: "過去の日時は選択できません",
                confirmButtonText: "OK",
              });
              return;
            }
            reservations.push({
              id: uuidv4(),
              names: selectedNames,
              date: date,
              dayIndex,
              timeIndex,
            });
          } else {
            const time = timeSlots[timeIndex];
            const [hour, minute] = time.split(":").map(Number);
            const date = new Date(year, month - 1, day, hour, minute);
            //過去の予約はできない
            if (date < endOfDay) {
              Swal.fire({
                icon: "warning",
                title: "エラー",
                text: "過去の日時は選択できません",
                confirmButtonText: "OK",
              });
              return;
            }
            reservations.push({
              id: uuidv4(),
              names: selectedNames,
              date: date,
              dayIndex,
              timeIndex,
            });
          }
        }
      }
    }
    // プリセットに登録する場合
    if (isPreset) {
      // presetsの状態が更新されてからaddPresetsを呼び出す
      const newPreset = selectedMembers.map((member) => member.lineId);
      addPresets(myLineId, newPreset);
    }
    //予約を追加
    isKinjyou
      ? addReservationsKinjyou(reservations)
      : addReservations(reservations);
    onClose(); // ポップアップを閉じる
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white  px-6 pb-6 pt-3 rounded shadow-md w-4/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">名前を選択してください</h3>
          <button
            className="text-lg font-bold hover:text-gray-800 focus:outline-none"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <MemberList
          members={members}
          selectedMembers={selectedMembers}
          handleAddSelectedMembers={handleAddSelectedMembers}
        />
        {/* プリセットに登録するかどうかのチェックボックス要素 */}
        <div>
          <input
            type="checkbox"
            id="preset"
            name="preset"
            onChange={() => handleIsAddPreset()}
          />
          <label htmlFor="preset" className="ml-1 text-sm">
            今回のメンバーをプリセットに登録する
          </label>
        </div>
        {/* ボタン要素 */}
        <div className="flex justify-between mt-4">
          <button className=" p-2 bg-sky-500  text-white rounded-full  ">
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
            className="p-2 bg-blue-500  text-white rounded-full w-20"
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
