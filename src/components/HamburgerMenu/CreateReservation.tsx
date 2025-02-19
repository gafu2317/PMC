import React, { useState, useEffect } from "react";
import { addReservationsAdmin } from "../../firebase/userService";
import { Member } from "../../types/type";
import { MemberList } from "../Forms";
import { timeSlots } from "../../utils/utils";
import Swal from "sweetalert2";

interface CreateReservationProps {
  members: Member[];
}

const CreateReservation: React.FC<CreateReservationProps> = ({ members }) => {
  // 選択されたメンバーを管理
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]); // 選択されたメンバーをMembersの配列で管理
  const [startTime, setStartTime] = useState(timeSlots[0]); // 初期値を最初のスロットに設定
  const [endTime, setEndTime] = useState(timeSlots[1]); // 初期値を2番目のスロットに設定
  const [date, setDate] = useState<Date>(); // 日付を管理
  const [formattedDate, setFormattedDate] = useState<Date[]>([]); // 日付をフォーマット
  const handleAddSelectedMembers = (member: Member) => {
    setSelectedMembers(
      (prev) =>
        prev.includes(member)
          ? prev.filter((m) => m.lineId !== member.lineId) // lineIdでフィルタリング
          : [...prev, member] // メンバーを追加
    );
  };
  const handleSubmit = () => {
    // 選択されたメンバーの名前を取得
    const selectedNames = selectedMembers.map((member) => member.name);
    if (selectedNames.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "エラー",
        text: "一名以上のメンバーを選択してください",
        confirmButtonText: "OK",
      });
      return;
    }
    if (!date) {
      Swal.fire({
        icon: "warning",
        title: "エラー",
        text: "日付を選択してください",
        confirmButtonText: "OK",
      });
      return;
    }
    //日付をフォーマットする
    const startHour = parseInt(startTime.split(":")[0], 10);
    const endHour = parseInt(endTime.split(":")[0], 10);
    if (startHour > endHour) {
      Swal.fire({
        icon: "warning",
        title: "エラー",
        text: "終了時刻は開始時刻より後にしてください",
        confirmButtonText: "OK",
      });
      return;
    }
    setFormattedDate(
      Array.from({ length: endHour - startHour }, (_, index) => {
        const formatedDate = new Date(date);
        formatedDate.setHours(startHour + index);
        return formatedDate;
      })
    );
    const reservations = formattedDate.map((date) => {
      return {
        names: selectedNames,
        date: date,
      };
    });
    addReservationsAdmin(reservations);
    setSelectedMembers([]);
    setStartTime(timeSlots[0]);
    setEndTime(timeSlots[1]);
    setDate(undefined);
    Swal.fire({
      icon: "success",
      title: "予約完了",
      confirmButtonText: "OK",
    });
  };
  return (
    <div>
      <h2 className="mb-2">予約データの作成</h2>
      <input
        className="mb-2"
        type="date"
        onChange={(e) => setDate(new Date(e.target.value))}
      />
      <div className="flex items-center  mb-2">
        <select
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="border rounded p-1 mr-2"
        >
          {timeSlots.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
        <span> ~ </span>
        <select
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="border rounded p-1 ml-2"
        >
          {timeSlots.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>
      <MemberList
        members={members}
        selectedMembers={selectedMembers}
        handleAddSelectedMembers={handleAddSelectedMembers}
      />
      <div className="flex justify-end mt-4">
        <button
          className="bg-blue-500 text-white rounded p-1"
          onClick={handleSubmit}
        >
          予約する
        </button>
      </div>
    </div>
  );
};

export default CreateReservation;
