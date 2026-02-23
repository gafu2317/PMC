import React, { useState } from "react";
import {
  getReservationsByDateRange,
  getReservationsByDateRangeKnjyou,
  getAllPeriodReservations,
  getAllPeriodReservationsKinjyou,
  deleteReservation,
  deleteReservationKinjyou,
} from "../../firebase/userService";
import Swal from "sweetalert2";

interface DeleteReservationDataProps {}

const DeleteReservationData: React.FC<DeleteReservationDataProps> = ({}) => {
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
  const [selectedMeikouIds, setSelectedMeikouIds] = useState<Set<string>>(new Set()); // 選択された名工予約のIDを管理
  const [selectedKinjyouIds, setSelectedKinjyouIds] = useState<Set<string>>(new Set()); // 選択された金城予約のIDを管理
  const selectedTotalSize = selectedMeikouIds.size + selectedKinjyouIds.size;
  const selectAllReservation = () => {
    if (selectedTotalSize === reservations.length + reservationsKinjyou.length) {
      setSelectedMeikouIds(new Set()); // すべて解除
      setSelectedKinjyouIds(new Set());
    } else {
      setSelectedMeikouIds(new Set(reservations.map((r) => r.id)));
      setSelectedKinjyouIds(new Set(reservationsKinjyou.map((r) => r.id)));
    }
  };
  const toggleSelectMeikou = (id: string) => {
    setSelectedMeikouIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  const toggleSelectKinjyou = (id: string) => {
    setSelectedKinjyouIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  const handleDeleteReservation = async () => {
    setLoading(true);
    for (const id of selectedMeikouIds) {
      await deleteReservation(id);
      setReservations((prev) => prev.filter((r) => r.id !== id));
    }
    for (const id of selectedKinjyouIds) {
      await deleteReservationKinjyou(id);
      setReservationsKinjyou((prev) => prev.filter((r) => r.id !== id));
    }
    setLoading(false);
    setSelectedMeikouIds(new Set());
    setSelectedKinjyouIds(new Set());
    Swal.fire({
      icon: "success",
      title: "削除が完了しました",
    });
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
            isAll || (!isAll && reservations.length === 0)
              ? "bg-gray-300"
              : "bg-gray-400"
          }`}
          onClick={fetchReservation}
        >
          予約を取得
        </button>
      </div>

      {/* 取得した予約を表示 */}
      {(reservations.length > 0 || reservationsKinjyou.length > 0) && (
        <div>
          <div className="flex justify-between mt-2">
            <button
              className="bg-blue-500 text-white rounded p-1 "
              onClick={selectAllReservation}
            >
              {selectedTotalSize ===
              reservations.length + reservationsKinjyou.length
                ? "すべて解除"
                : "すべて選択"}
            </button>
          </div>
          <ul className="mt-4">
            <p className="text-lg mb-1">名工の予約</p>
            {reservations.map((reservation) => (
              <li key={reservation.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedMeikouIds.has(reservation.id)}
                  onChange={() => toggleSelectMeikou(reservation.id)}
                  className="mr-2"
                />
                {/* 日付と時間を表示 */}
                {`${
                  reservation.date.getMonth() + 1
                }/${reservation.date.getDate()}, ${reservation.date.getHours()}:${String(
                  reservation.date.getMinutes()
                ).padStart(2, "0")}`}
                - {reservation.names.join(", ")}
              </li>
            ))}
            <p className="text-lg mb-1">金城の予約</p>
            {reservationsKinjyou.map((reservation) => (
              <li key={reservation.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedKinjyouIds.has(reservation.id)}
                  onChange={() => toggleSelectKinjyou(reservation.id)}
                  className="mr-2"
                />
                {/* 日付と時間を表示 */}
                {`${
                  reservation.date.getMonth() + 1
                }/${reservation.date.getDate()}, ${reservation.date.getHours()}:${String(
                  reservation.date.getMinutes()
                ).padStart(2, "0")}`}
                - {reservation.names.join(", ")}
              </li>
            ))}
          </ul>

          <div className="flex justify-end mt-4">
            {loading && <span>削除中...</span>}
            <button
              className="bg-red-500 text-white rounded p-1"
              onClick={handleDeleteReservation}
            >
              削除
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteReservationData;
