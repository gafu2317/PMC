import React, { useState } from "react";
import { Member } from "../types/type";
import {
  getReservationsByDateRange,
  deleteReservation,
  deleteUser,
  getAllPeriodReservations,
} from "../firebase/userService";
import Swal from "sweetalert2";

interface HamburgerMenuProps {
  members: Member[];
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ members }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reservations, setReservations] = useState<
    { id: string; names: string[]; date: Date }[]
  >([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false); // ローディング状態を管理
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set()
  );
  const [isAll, setIsAll] = useState(false); //全て選択されているかどうか
  const [isCopy, setIsCopy] = useState(false); //コピーされているかどうか

  const handleMenuClick = (action: string) => {
    if (selectedAction === action) {
      setSelectedAction(null);
    } else {
      setSelectedAction(action);
    }
    setStartDate("");
    setEndDate("");
    setReservations([]);
    setSelectedIds(new Set());
    setSearchTerm("");
    setSelectedMembers(new Set());
    setIsAll(false);
    setIsCopy(false);
  };

  const calculateFees = (
    reservations: { id: string; names: string[]; date: Date }[]
  ) => {
    const fees: { name: string; fee: number }[] = []; // 名前と料金のオブジェクトの配列
    const feeMap: { [key: string]: number } = {}; // 名前ごとの料金を一時的に保持するマップ
    reservations.forEach((reservation) => {
      const feePerPerson = 100 / reservation.names.length;
      reservation.names.forEach((name) => {
        const member = members.find((member) => member.name === name);
        const memberName = member ? member.name : name; // メンバー名を取得

        // 一時マップに料金を加算
        feeMap[memberName] = (feeMap[memberName] || 0) + feePerPerson;
      });
    });
    // マップを配列に変換
    for (const [name, fee] of Object.entries(feeMap)) {
      fees.push({ name, fee });
    }
    return fees; // 名前と料金のオブジェクトの配列を返す
  };

  const generateClipboardData = (
    reservations: { id: string; names: string[]; date: Date }[]
  ) => {
    const fees = calculateFees(reservations);
    const data = reservations.map((reservation, index) => {
      const date = `${reservation.date.getFullYear()}/${
        reservation.date.getMonth() + 1
      }/${reservation.date.getDate()} ${reservation.date.getHours()}:${String(
        reservation.date.getMinutes()
      ).padStart(2, "0")}`;
      const names = reservation.names.join(",");
      const name = fees[index] ? fees[index].name : "";
      const fee = fees[index] ? fees[index].fee : "";
      return `${date}\t${names}\t${""}\t${name}\t${fee}`;
    });
    return data.join("\n");
  };

  const handleCopyData = () => {
    const heder = "予約日時\t使用者の名前\t\t名前\t料金";
    const clipboardData = generateClipboardData(reservations);
    const data = `${heder}\n${clipboardData}`;
    navigator.clipboard
      .writeText(data)
      .then(() => {
        console.log("データがクリップボードにコピーされました");
        setIsCopy(true);
        setReservations([]);
        setIsAll(false);
      })
      .catch((err) => {
        console.error("クリップボードへのコピーに失敗しました:", err);
        setIsCopy(false);
      });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleSelectMember = (lineId: string) => {
    setSelectedMembers((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(lineId)) {
        newSelected.delete(lineId);
      } else {
        newSelected.add(lineId);
      }
      return newSelected;
    });
  };

  const handleDeleteSelected = async () => {
    for (const lineId of selectedMembers) {
      setLoading(true);
      await deleteUser(lineId);
      setLoading(false);
    }
    setSelectedMembers(new Set());
  };

  const filteredMembers = members.filter((member) =>
    member.name.includes(searchTerm)
  );

  const SelectAllMember = () => {
    if (selectedMembers.size === filteredMembers.length) {
      // 全て選択されている場合は解除
      setSelectedMembers(new Set());
    } else {
      // 全て選択
      const allSelected = new Set(
        filteredMembers.map((member) => member.lineId)
      );
      setSelectedMembers(allSelected);
    }
  };

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

  const toggleSelect = (id: string) => {
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

  const handleReservationDelete = async () => {
    for (const id of selectedIds) {
      setLoading(true);
      await deleteReservation(id);
      setLoading(false);
    }
    // 削除後は選択を解除する場合
    setSelectedIds(new Set());
  };

  const selectAllReservation = () => {
    if (selectedIds.size === reservations.length) {
      setSelectedIds(new Set()); // すべて解除
    } else {
      const allIds = new Set(reservations.map((reservation) => reservation.id));
      setSelectedIds(allIds); // すべて選択
    }
  };

  const correctPassword = "a"; // ここに正しいパスワードを設定

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      Swal.fire({
        icon: "warning",
        title: "エラー",
        text: "パスワードが間違っています",
        confirmButtonText: "OK",
      });
    }
  };

  const renderForm = () => {
    if (!selectedAction) return null;
    switch (selectedAction) {
      case "deleteReservation":
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
                className={` rounded p-1 ${
                  isAll ? "bg-gray-400" : "bg-gray-300"
                }`}
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
                        onChange={() => toggleSelect(reservation.id)}
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
                  <button
                    className="bg-red-500 text-white rounded p-1"
                    onClick={handleReservationDelete}
                  >
                    削除
                  </button>
                  {loading && <span>削除中...</span>}
                </div>
              </div>
            )}
          </div>
        );

      case "changeMemberData":
        return (
          <div>
            <h2 className="mb-2">部員データの削除</h2>
            <input
              type="text"
              placeholder="名前(一部でも可)"
              className="border rounded p-1 mb-2 w-full"
              value={searchTerm}
              onChange={handleSearchChange} // 入力が変更されたときに呼び出す
            />

            {/* フィルタリングされたメンバーの表示 */}
            {filteredMembers.length > 0 && (
              <div>
                <button
                  className="bg-blue-500 text-white rounded p-1 "
                  onClick={SelectAllMember}
                >
                  {selectedMembers.size === filteredMembers.length
                    ? "すべて解除"
                    : "すべて選択"}
                </button>
                <ul className="mt-4">
                  {filteredMembers.map((member) => (
                    <li
                      key={member.lineId}
                      className="flex items-center border-b py-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.has(member.lineId)}
                        onChange={() => toggleSelectMember(member.lineId)}
                        className="mr-2"
                      />
                      {member.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                className="bg-red-500 text-white rounded p-1"
                onClick={handleDeleteSelected}
              >
                削除
              </button>
              {loading && <span>削除中...</span>}
            </div>
          </div>
        );

      case "copyReservation":
        return (
          <div>
            <h2 className="mb-2">コピーしたいデータの期間を入力</h2>
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
                className={` rounded p-1 ${
                  isAll ? "bg-gray-400" : "bg-gray-300"
                }`}
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
            {reservations.length > 0 && <p>データ取得しました</p>}
            {isCopy && <p>コピーしました!</p>}
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-300 rounded p-1"
                onClick={handleCopyData}
              >
                コピー
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* ハンバーガーメニュー */}
      <button
        className="absolute top1 left-1 p-1 flex w-7 h-7 flex-col items-center justify-center bg-gray-600 text-white rounded focus:outline-none"
        onClick={toggleMenu}
      >
        <div className="w-full h-0.5 bg-white mb-1"></div>
        <div className="w-full h-0.5 bg-white mb-1"></div>
        <div className="w-full h-0.5 bg-white"></div>
      </button>

      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={toggleMenu}
        />
      )}

      {/* メニューとパスワード入力フォーム */}
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 "
          onClick={toggleMenu}
        >
          {!isAuthenticated ? (
            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-lg rounded p-6"
              onClick={(e) => e.stopPropagation()} // クリックイベントの伝播を止める
            >
              <label className="mb-2 block">
                パスワードを入力してください:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 p-2 rounded mb-4 w-full"
                required
                onClick={(e) => e.stopPropagation()} // クリックイベントの伝播を止める
              />
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded w-full"
              >
                決定
              </button>
            </form>
          ) : (
            <div
              className="bg-white shadow-lg rounded p-4 w-4/5 h-80 overflow-y-auto"
              onClick={(e) => e.stopPropagation()} // クリックイベントの伝播を止める
            >
              {/* &timesは×ボタン */}
              <div className="flex justify-between items-center">
                <h2 className="flex-grow text-center text-lg font-semibold">
                  管理者メニュー
                </h2>
                <button
                  className="text-lg font-bold hover:text-gray-800 focus:outline-none"
                  onClick={toggleMenu}
                >
                  &times;
                </button>
              </div>
              <ul className="py-2">
                {[
                  "deleteReservation",
                  "changeMemberData",
                  "copyReservation",
                ].map((action) => (
                  <li
                    key={action}
                    className={`px-4 py-2 hover:bg-gray-200 ${
                      selectedAction === action ? "bg-gray-300" : ""
                    }`} // クリックされた項目の背景色を変更
                    onClick={() => handleMenuClick(action)}
                  >
                    {action === "deleteReservation" && "・予約データの削除"}
                    {action === "changeMemberData" && "・部員データの削除"}
                    {action === "copyReservation" && "・予約データのコピー"}
                  </li>
                ))}
              </ul>
              {/* 選択された項目に応じたフォームを表示 */}
              {selectedAction && <div className="mt-4">{renderForm()}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
