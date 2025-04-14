import React, { useState } from "react";
import {
  getReservationsByDateRange,
  getReservationsByDateRangeKnjyou,
  getAllPeriodReservations,
  getAllPeriodReservationsKinjyou,
  updateMemberFees,
} from "../../firebase/userService";
import { Member, Band } from "../../types/type";
import { showError, showSuccess } from "../../utils/swal";

interface CalculateProps {
  members: Member[];
  bands: Band[];
}

const Calculate: React.FC<CalculateProps> = ({ members, bands }) => {
  const [startDate, setStartDate] = useState(""); // 開始日を管理
  const [endDate, setEndDate] = useState(""); // 終了日を管理
  const [isAll, setIsAll] = useState(true); //全て選択されているかどうか
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = members.filter((member) =>
    member.name.includes(searchTerm)
  );

  const handleCalculate = async () => {
    // 予約を取得
    let reservations: {
      id: string;
      names: string[];
      date: Date;
    }[] = [];
    if (isAll) {
      const reservationsMeikou = await getAllPeriodReservations();
      const reservationsKinjyou = await getAllPeriodReservationsKinjyou();
      reservations = [...reservationsMeikou, ...reservationsKinjyou];
    } else {
      if (startDate && endDate) {
        if (startDate > endDate) {
          showError("開始日は終了日よりも前の日付にしてください");
          return;
        }
        const reservationsMeikou = await getReservationsByDateRange(
          new Date(startDate),
          new Date(endDate)
        );
        const reservationsKinjyou = await getReservationsByDateRangeKnjyou(
          new Date(startDate),
          new Date(endDate)
        );
        reservations = [...reservationsMeikou, ...reservationsKinjyou];
      } else {
        showError("予約を取得する期間を選択してください");
        return;
      }
    }
    // 学スタ料金を計算
    // メンバーごとの料金計算用のマップを作成
    const memberFees: { [key: string]: number } = {};

    // 各予約について処理
    reservations.forEach((reservation) => {
      const feePerPerson = 100 / reservation.names.length; // 一人あたりの料金
      reservation.names.forEach((name) => {
        if (!memberFees[name]) {
          memberFees[name] = 0;
        }
        memberFees[name] += feePerPerson;
      });
    });

    // バンド出演費の計算（メンバーごとに500円、複数バンドでも合計500円）
    const performanceFees: { [key: string]: number } = {};

    // バンドメンバーを確認し、出演費を設定
    bands.forEach((band) => {
      band.memberIds.forEach((memberId) => {
        // 既に出演費が設定されていなければ500円を設定
        performanceFees[memberId] = 500;
      });
    });

    // 更新対象のデータを準備
    const updates = members.map((member) => {
      // 学スタ使用料（予約料）を計算（小数点以下切りすて）
      const studyFee = memberFees[member.name]
        ? Math.floor(memberFees[member.name])
        : 0;

      // 出演費を取得（バンドに所属していれば500円、そうでなければ0円）
      const performanceFee = performanceFees[member.lineId] || 0;

      return {
        lineId: member.lineId,
        studyFee: studyFee,
        performanceFee: performanceFee,
      };
    });

    try {
      // 一括更新を実行（studyFeeとperformanceFeeの両方を更新）
      await updateMemberFees(updates);
      showSuccess(`料金計算が完了しました`);
    } catch (error) {
      showError("料金更新に失敗しました");
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="mb-2">料金を計算する期間を入力</h2>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block my-1 text-xs">開始日</label>
          <input
            type="date"
            className="border rounded p-1 mb-2 w-full"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block mb-1 text-xs">終了日</label>
          <input
            type="date"
            className="border rounded p-1 mb-2 w-full"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-around">
        <button
          className={` text-sm rounded p-1 ${
            isAll ? "bg-green-400" : "bg-gray-300"
          }`}
          onClick={() => setIsAll(true)}
        >
          全ての期間
        </button>
        <button
          className={` text-sm rounded p-1 ${
            isAll ? "bg-gray-300" : "bg-green-400"
          }`}
          onClick={() => setIsAll(false)}
        >
          指定した期間
        </button>
      </div>
      <div className="flex justify-end my-2 items-center">
        <button
          className="bg-gray-300 rounded p-1 w-20 "
          onClick={() => handleCalculate()}
        >
          料金計算
        </button>
      </div>
      <input
        type="text"
        placeholder="名前(一部でも可)"
        className="border rounded p-1 mb-2 w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} // 入力が変更されたときに呼び出す
      />
      <div className=" h-32 overflow-y-auto border rounded p-2 mb-2">
        <ul className="">
          {filteredMembers.map((member) => (
            <li key={member.lineId} className="border-b py-2">
              <span className="font-medium w-full">{member.name}</span>
              <div className="text-sm text-gray-600 mt-1 flex items-center space-x-2">
                <div>罰金:{member.fine}円</div>
                <div>出演費:{member.performanceFee}円</div>
                <div>学スタ:{member.studyFee}円</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Calculate;
