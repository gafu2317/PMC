import React, { useState, useEffect } from "react";
import {
  getReservationsByDateRange,
  getAllPeriodReservations,
  deleteReservation,
  deleteFine,
  addUnpaidFee,
} from "../../firebase/userService";
import { sendMessages } from "../../liff/liffService";
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
  const [isNotify, setIsNotify] = useState(false); //通知されているかどうか
  const [isCopy, setIsCopy] = useState(false); //コピーされているかどうか
  const [isDelete, setIsDelete] = useState(false); //削除されているかどうか
  const [userData, setUserData] = useState<
    {
      name: string;
      lineId: string;
      fee: number;
      fine: number;
      performanceFee: number;
      unPaidFee: number;
      total: number;
    }[]
  >([]); // ユーザーの料金データを管理
  const [reservationData, setReservationData] = useState<
    { id: string; reservation: string; names: string[] }[]
  >([]); // 予約データを管理(整形済み)

  const fetchReservation = async () => {
    if (startDate && endDate) {
      const fetchedReservations = await getReservationsByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
      setReservations(fetchedReservations);
      generateReservationData(fetchedReservations);
      setIsAll(false);
    }
  };

  const fetchAllReservation = async () => {
    const fetchedReservations = await getAllPeriodReservations();
    setReservations(fetchedReservations);
    generateReservationData(fetchedReservations);
    setIsAll(true);
  };

  const getFine = (name: string) => {
    const member = members.find((member) => member.name === name);
    return member ? member.fine : 0;
  };

  const getUnpaidFee = (name: string) => {
    const member = members.find((member) => member.name === name);
    return member ? member.unPaidFee : 0;
  }

  const generateReservationData = (
    reservations: { id: string; names: string[]; date: Date }[]
  ) => {
    const reservationData = reservations.map((reservation) => {
      const date = reservation.date;
      const formattedDate = `${date.getFullYear()}/${
        date.getMonth() + 1
      }/${date.getDate()} ${date.getHours()}:${String(
        date.getMinutes()
      ).padStart(2, "0")}`;
      return {
        id: reservation.id,
        reservation: formattedDate,
        names: reservation.names,
      };
    });
    setReservationData(reservationData);
  };

  const changeNameToLineId = (name: string) => {
    const member = members.find((member) => member.name === name);
    return member ? member.lineId : "";
  };

  const generateUserData =(
    reservations: { id: string; names: string[]; date: Date }[]
  ) => {
    const userData: {
      name: string;
      lineId: string;
      fee: number;
      fine: number;
      performanceFee: number;
      unPaidFee: number;
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
        feeMap[memberName] = (feeMap[memberName] || 0) + feePerPerson;
      });
    });
    // マップを配列に変換
    for (const [name, fee] of Object.entries(feeMap)) {
      const fine = getFine(name);
      const performanceFee = bandMemberNames.includes(name) ? 500 : 0;
      const roundedFee = Math.round(fee);
      const lineId = changeNameToLineId(name);
      const unPaidFee = getUnpaidFee(name);
      const total = roundedFee + fine + performanceFee + unPaidFee;
      userData.push({
        name,
        lineId,
        fee: roundedFee,
        fine,
        performanceFee,
        unPaidFee,
        total,
      });
    }
    setUserData(userData); // 名前と料金のオブジェクトの配列を返す
  };

  useEffect(() => {
    if (reservations.length > 0) {
      generateUserData(reservations);
    }
  }, [reservations]);

  const generateClipboardData = async () => {
    const maxLength = Math.max(userData.length, reservationData.length);
    let data = [];
    for (let i = 0; i < maxLength; i++) {
      const user = userData[i] || {
        name: "",
        fee: "",
        fine: "",
        performanceFee: "",
        unPaidFee: "",
        total: "",
      };
      const reservation = reservationData[i] || {
        reservation: "",
        names: "",
      };
      data.push(
        `${reservation.reservation}\t${reservation.names}\t""\t${user.name}\t${user.fee}\t${user.performanceFee}\t${user.fine}\t${user.unPaidFee}\t${user.total}`
      );
    }
    const heder =
      "予約日時\t使用者の名前\t\t名前\t学スタ使用料\tライブ出演費\t罰金\t未払金\t合計";
    return `${heder}\n${data.join("\n")}`;
  };

  const handleClick = async () => {
    if (reservations.length === 0) {
      Swal.fire({
        icon: "error",
        title: "期間が選択されていないか、予約データがありません",
      });
      return;
    }
    //料金の通知
    for (const user of userData) {
      await sendMessages(
        user.lineId,
        `学スタ使用料金等のお知らせ\n学スタ使用料: ${user.fee}円\nライブ出演費: ${user.performanceFee}円\n罰金: ${user.fine}円\n未払金: ${user.unPaidFee}\n合計: ${user.total}円`
      );
    }
    setIsNotify(true);
    //クリップボードにコピー
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
    //予約データを削除
    for (const reservation of reservationData) {
      await deleteReservation(reservation.id);
    }
    //罰金を削除 & 未払い料金を追加
    for (const user of userData) {
      if (user.fine > 0) {
        await deleteFine(user.lineId);
      }
      if (user.total > 0) {
        await addUnpaidFee(user.lineId, user.total);
      }
    }
    setIsDelete(true);
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
      <span className="text-xs">注意:決定ボタンを押すと以下が実行されます。</span>
      <ul className="list-disc ml-4 text-xs" >
        <li>各メンバーに料金の通知</li>
        <li>クリップボードにデータをコピー</li>
        <li>指定された期間の予約データを削除</li>
        <li>罰金データを削除(バンド費用等とともに未払金に追加されます)</li>
        <li>未払い料金をデータに追加</li>
      </ul>
      {reservations.length > 0 && <p className="p-1">データ取得しました</p>}
      {isNotify && <p className="p-1">通知しました！</p>}
      {isCopy && <p className="p-1">コピーしました！</p>}
      {isDelete && <p className="p-1">予約データを削除しました！</p>}
      <div className="flex justify-end mt-4 items-center">
        <button className="bg-gray-300 rounded p-1 w-16 " onClick={handleClick}>
          決定
        </button>
      </div>
    </div>
  );
};

export default Calculate;
