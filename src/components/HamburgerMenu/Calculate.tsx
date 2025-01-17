import React, { useState } from "react";
import {
  getReservationsByDateRange,
  getAllPeriodReservations,
  getFine,
} from "../../firebase/userService";
import { Member, Band } from "../../types/type";
import Swal from "sweetalert2";

interface CalculateProps {
  members: Member[];
  bands: Band[];
}

const Calculate: React.FC<CalculateProps> = ({ members, bands }) => {
  const [startDate, setStartDate] = useState(""); // 開始日を管理
  const [endDate, setEndDate] = useState(""); // 終了日を管理
  const [isAll, setIsAll] = useState(false); //全て選択されているかどうか
  const [reservations, setReservations] = useState<
    { id: string; names: string[]; date: Date }[]
  >([]); // 予約情報を管理
  const [isCalculate, setIsCalculate] = useState(false); //計算されているかどうか
  const [isNotify, setIsNotify] = useState(false); //通知されているかどうか
  const [isCopy, setIsCopy] = useState(false); //コピーされているかどうか
  const [isDelete, setIsDelete] = useState(false); //削除されているかどうか


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

  const fetchFine = async (name: string) => {
    const lineId = members.find((member) => member.name === name)?.lineId;
    if (!lineId) {
      return 0;
    }
    const fine = await getFine(lineId);
    return fine ?? 0; // undefined の場合は0を返す
  };

  const generateUserData = async (
    reservations: { id: string; names: string[]; date: Date }[]
  ) => {
    const userData: {
      name: string;
      fee: number;
      fine: number;
      performanceFee: number;
      total: number;
    }[] = []; // 名前と料金のオブジェクトの配列
    // バンドメンバーを取得
    const bandMemberIds = new Set(bands.map((band) => band.memberIds).flat());
    const bandMemberNames = members.map((member) =>
      bandMemberIds.has(member.lineId) ? member.name : ""
    );

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
      const fine = await fetchFine(name);
      const performanceFee = bandMemberNames.includes(name) ? 500 : 0;
      const roundedFee = Math.round(fee);
      const total = roundedFee + fine + performanceFee;
      userData.push({ name, fee: roundedFee, fine, performanceFee, total });
    }
    return userData; // 名前と料金のオブジェクトの配列を返す
  };

  const generateReservationData = (
    reservations: { id: string; names: string[]; date: Date }[]
  ) => {
    const data = reservations.map((reservation) => {
      const ReservationDate = `${reservation.date.getFullYear()}/${
        reservation.date.getMonth() + 1
      }/${reservation.date.getDate()} ${reservation.date.getHours()}:${String(
        reservation.date.getMinutes()
      ).padStart(2, "0")}`;
      const names = reservation.names.join(",");
      return `${ReservationDate}\t${names}`;
    });
    return data;
  };

  const generateClipboardData = async () => {
    const userData = await generateUserData(reservations);
    const reservationData = generateReservationData(reservations);
    const maxLength = Math.max(userData.length, reservationData.length);
    let data = [];
    for (let i = 0; i < maxLength; i++) {
      const user = userData[i] || {
        name: "",
        fee: "",
        fine: "",
        performanceFee: "",
        total: "",
      };
      const reservation = reservationData[i] || "";
      data.push(
        `${reservation}\t""\t${user.name}\t${user.fee}\t${user.performanceFee}\t${user.fine}\t${user.total}`
      );
    }
    const heder =
      "予約日時\t使用者の名前\t\t名前\t学スタ使用料\tライブ出演費\t罰金\t合計";
    return `${heder}\n${data.join("\n")}`;
  };

  const handleCalculate = async () => {
    setIsCalculate(true);
  }

  const handleNotify = async () => {
    setIsNotify(true);
  }

  const handleDelete = async () => {
    setIsDelete(true);
  }

  const handleCopy = async () => {
    const data = await generateClipboardData();
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
        Swal.fire({
          icon: "error",
          title: "クリップボードへのコピーに失敗しました",
        });
        setIsCopy(false);
      });
  };
  return (
    <div>
      <h2 className="mb-2">料金を計算する期間を入力</h2>
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
      <div className="flex justify-around mt-4">
        <button
          className={` rounded p-1 ${isAll ? "bg-gray-400" : "bg-gray-300"}`}
          onClick={fetchAllReservation}
        >
          全ての期間
        </button>
        <button
          className={` rounded p-1 ${
            isAll || (!isAll && reservations.length === 0)
              ? "bg-gray-300"
              : "bg-gray-400"
          }`}
          onClick={fetchReservation}
        >
          指定した期間
        </button>
      </div>
      {reservations.length > 0 && <p>データ取得しました</p>}
      <div className="flex justify-end mt-4 items-center">
        {isCalculate && (<p>計算完了！</p>)}
        <button
          className="bg-gray-300 rounded p-1 w-20"
          onClick={handleCopy}
        >
          1.計算
        </button>
      </div>
      <div className="flex justify-end mt-4 items-center">
        {isNotify && (<p>通知しました！</p>)}
        <button
          className="bg-gray-300 rounded p-1 w-20"
          onClick={handleCopy}
        >
          2.通知
        </button>
      </div>
      <div className="flex justify-end mt-4 items-center">
        {isCopy && (<p>コピーしました！</p>)}
        <button
          className="bg-gray-300 rounded p-1 w-20"
          onClick={handleCopy}
        >
          3.コピー
        </button>
      </div>
      <div className="flex justify-end mt-4 items-center">
        {isDelete && (<p>削除しました！</p>)}
        <button
          className="bg-gray-300 rounded p-1 w-20"
          onClick={handleCopy}
        >
          4.削除
        </button>
      </div>
    </div>
  );
};

export default Calculate;
