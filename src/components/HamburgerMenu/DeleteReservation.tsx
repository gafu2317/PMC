import React, { useState } from "react";
import {
  getReservationsByDateRange,
  getAllPeriodReservations,
  deleteReservation,
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
  const [loading, setLoading] = useState(false); // ローディング状態を管理
  const fetchReservation = async () => {
    if (startDate && endDate) {
      const fetchedReservations = await getReservationsByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
      setReservations(fetchedReservations);
      setIsAll(false);
    }
  };
  const fetchAllReservation = async () => {
    const fetchedReservations = await getAllPeriodReservations();
    setReservations(fetchedReservations);
    setIsAll(true);
  };
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set()); // 選択された予約のIDを管理
  const selectAllReservation = () => {
    if (selectedIds.size === reservations.length) {
      setSelectedIds(new Set()); // すべて解除
    } else {
      const allIds = new Set(reservations.map((reservation) => reservation.id));
      setSelectedIds(allIds); // すべて選択
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
  const handleDeleteReservation = async () => {
    for (const id of selectedIds) {
      setLoading(true);
      await deleteReservation(id);
      setLoading(false);
      setReservations((prev) =>
        prev.filter((reservation) => reservation.id !== id)
      );
    }
    setSelectedIds(new Set());
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
      {reservations.length > 0 && (
        <div>
          <div className="flex justify-between mt-2">
            <button
              className="bg-blue-500 text-white rounded p-1 "
              onClick={selectAllReservation}
            >
              {selectedIds.size === reservations.length
                ? "すべて解除"
                : "すべて選択"}
            </button>
          </div>
          <ul className="mt-4">
            {reservations.map((reservation) => (
              <li key={reservation.id} className="flex items-center">
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
