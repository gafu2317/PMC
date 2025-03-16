import React, { useState } from "react";
import {
  getReservationsByDateRange,
  getReservationsByDateRangeKnjyou,
  getAllPeriodReservations,
  getAllPeriodReservationsKinjyou,
  updateReservation,
  updateReservationKinjyou,
} from "../../firebase/userService";
import { MemberList } from "../Forms";
import { Member } from "../../types/type";
import Swal from "sweetalert2";

interface EditReservationProps {
  members: Member[];
}

const EditReservation: React.FC<EditReservationProps> = ({ members }) => {
  const [startDate, setStartDate] = useState(""); // 開始日を管理
  const [endDate, setEndDate] = useState(""); // 終了日を管理
  const [isAll, setIsAll] = useState(false); //全て選択されているかどうか
  const [reservations, setReservations] = useState<
    { id: string; names: string[]; date: Date }[]
  >([]); // 予約情報を管理
  const [reservationsKinjyou, setReservationsKinjyou] = useState<
    { id: string; names: string[]; date: Date }[]
  >([]); // 金城の予約情報を管理
  const [loading, setLoading] = useState(false); // ローディング状態を管理
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set()); // 選択された予約のIDを管理
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]); // 選択されたメンバーをMembersの配列で管理
  const handleAddSelectedMembers = (member: Member) => {
    setSelectedMembers((prev) =>
      prev.includes(member)
        ? prev.filter((m) => m.lineId !== member.lineId)
        : [...prev, member]
    );
  };
  const fetchReservation = async () => {
    if (startDate && endDate) {
      const fetchedReservations = await getReservationsByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
      const fetchedReservationsKinjyou = await getReservationsByDateRangeKnjyou(
        new Date(startDate),
        new Date(endDate)
      );
      setReservations(fetchedReservations);
      setReservationsKinjyou(fetchedReservationsKinjyou);
      setIsAll(false);
    }
  };
  const fetchAllReservation = async () => {
    const fetchedReservations = await getAllPeriodReservations();
    const fetchedReservationsKinjyou = await getAllPeriodReservationsKinjyou();
    setReservations(fetchedReservations);
    setReservationsKinjyou(fetchedReservationsKinjyou);
    setIsAll(true);
  };
  const selectAllReservation = () => {
    if (selectedIds.size === reservations.length + reservationsKinjyou.length) {
      setSelectedIds(new Set()); // すべて解除
    } else {
      const allIds = new Set(reservations.map((reservation) => reservation.id));
      const allIdsKinjyou = new Set(
        reservationsKinjyou.map((reservation) => reservation.id)
      );
      const combinedIds = new Set([...allIds, ...allIdsKinjyou]);
      setSelectedIds(combinedIds); // すべて選択
    }
  };
  const toggleSelectReservation = (id: string) => {
    setSelectedIds((prev) => {
      const newSelectedIds = new Set(prev);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id); // すでに選択されている場合は解除
      } else {
        newSelectedIds.add(id); // 選択
      }
      return newSelectedIds;
    });
  };
  const handleUpdateReservation = async () => {
    if (selectedIds.size === 0) {
      return;
    }
    setLoading(true);
    const newMembers = selectedMembers.map((member) => member.name);
    for (const id of selectedIds) {
      await updateReservation(id, newMembers);
      await updateReservationKinjyou(id, newMembers);
    }
    setLoading(false);
    if(isAll) {
      fetchAllReservation();
    } else {
      fetchReservation();
    }
    Swal.fire("予約を変更しました", "", "success");
  };
  return (
    <div>
      <h2 className="mb-2">予約の取得</h2>
      <label className="block mb-1 text-xs">開始日</label>
      <input
        type="date"
        className="border rounded p-1 mb-2 w-full"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <label className="block mb-1 text-xs">終了日</label>
      <input
        type="date"
        className="border rounded p-1 mb-2 w-full"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <div className="flex justify-between mt-4">
        <button
          className={` rounded p-1 ${isAll ? "bg-gray-400" : "bg-gray-300"}`}
          onClick={fetchAllReservation}
        >
          全ての予約を取得
        </button>
        <button
          className={` rounded p-1 ${
            isAll ||
            (!isAll && reservations.length + reservationsKinjyou.length === 0)
              ? "bg-gray-300"
              : "bg-gray-400"
          }`}
          onClick={fetchReservation}
        >
          予約を取得
        </button>
      </div>

      {/* 取得した予約を表示 */}
      {(reservations.length || reservationsKinjyou.length) > 0 && (
        <div>
          <div className="flex justify-between mt-2">
            <button
              className="bg-blue-500 text-white rounded p-1 "
              onClick={selectAllReservation}
            >
              {selectedIds.size ===
              reservations.length + reservationsKinjyou.length
                ? "すべて解除"
                : "すべて選択"}
            </button>
          </div>
          <ul className="my-2">
            <p className="text-lg mb-1">名工の予約</p>
            {reservations.map((reservation) => (
              <li key={reservation.id} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={selectedIds.has(reservation.id)}
                  onChange={() => toggleSelectReservation(reservation.id)}
                  className="mr-2"
                />
                {/* 日付と時間を表示 */}
                {`${
                  reservation.date.getMonth() + 1
                }/${reservation.date.getDate()}, ${reservation.date.getHours()}:${String(
                  reservation.date.getMinutes()
                ).padStart(2, "0")}-${reservation.names.join(",")}`}
                <button></button>
              </li>
            ))}
            <p className="text-lg mb-1">金城の予約</p>
            {reservationsKinjyou.map((reservation) => (
              <li key={reservation.id} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={selectedIds.has(reservation.id)}
                  onChange={() => toggleSelectReservation(reservation.id)}
                  className="mr-2"
                />
                {/* 日付と時間を表示 */}
                {`${
                  reservation.date.getMonth() + 1
                }/${reservation.date.getDate()}, ${reservation.date.getHours()}:${String(
                  reservation.date.getMinutes()
                ).padStart(2, "0")}-${reservation.names.join(",")}`}
              </li>
            ))}
          </ul>
          <MemberList
            members={members}
            selectedMembers={selectedMembers}
            handleAddSelectedMembers={handleAddSelectedMembers}
          />
          <div className="text-xs mt-1">
            ※チェックした予約のメンバーが選択したメンバーに変更されます
          </div>
          <div className="flex justify-end mt-4">
            {loading && <span>変更中...</span>}
            <button
              className="bg-blue-500 text-white rounded p-1"
              onClick={handleUpdateReservation}
            >
              メンバー変更
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditReservation;
