import React, { useState } from "react";
import {
  deleteBand,
  deleteReservation,
  deleteReservationKinjyou,
  batchUpdateUnpaidFees,
  getAllPeriodReservations,
  getAllPeriodReservationsKinjyou,
  getReservationsByDateRange,
  getReservationsByDateRangeKnjyou,
} from "../../firebase/userService";
import { sendMessages } from "../../liff/liffService";
import { Member, Band } from "../../types/type";
import { showError, showSuccess } from "../../utils/swal";
import { downloadTextFile } from "../../utils/utils";

interface PriceConfProps {
  members: Member[];
  bands: Band[];
}

const PriceConf: React.FC<PriceConfProps> = (
  {
    members,bands
  }
) => {
  const [startDate, setStartDate] = useState(""); // 開始日を管理
  const [endDate, setEndDate] = useState(""); // 終了日を管理
  const [isAll, setIsAll] = useState(true); //全て選択されているかどうか

  const generateReservationText = (reservations: any[]): string => {
    let text = "予約データ一覧\n\n";

    reservations.forEach((reservation, index) => {
      const date = reservation.date.toLocaleDateString("ja-JP");
      const names = reservation.names.join(", ");

      text += `予約 ${index + 1}:\n`;
      text += `日付: ${date}\n`;
      text += `予約者: ${names}\n\n`;
    });

    return text;
  };

  // 予約データをクリップボードにコピーする関数
  const copyReservationsToClipboard = (reservations: any[]): void => {
    // ヘッダー行
    let text = "日付\t時間\t予約者\n";

    // データ行
    reservations.forEach((reservation) => {
      const date = reservation.date.toLocaleDateString("ja-JP");
      const time = reservation.date.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const names = reservation.names.join(", ");

      text += `${date}\t${time}\t${names}\n`;
    });

    // クリップボードにコピー
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showSuccess(
          "予約データがクリップボードにコピーされました。Excelに貼り付けてください。"
        );
      })
      .catch((err) => {
        console.error("クリップボードへのコピーに失敗しました:", err);
        showError("クリップボードへのコピーに失敗しました。");
      });
  };

  const handleConf = async () => {
    //削除する予約を取得
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
    //予約データをテキストファイルにする
    const text = generateReservationText(reservations);
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式
    //テキストファイルをダウンロード
    downloadTextFile(text, `予約データ_${today}.txt`);
    // 予約データをクリップボードにコピー
    copyReservationsToClipboard(reservations);
    //料金の通知
    for (const member of members) {
      await sendMessages(
        member.lineId,
        `学スタ使用料金等のお知らせ\n学スタ使用料: ${
          member.studyFee
        }円\nライブ出演費: ${member.performanceFee}円\n罰金: ${
          member.fine
        }円\n未払金: ${member.unPaidFee}円\n合計: ${
          member.studyFee +
          member.performanceFee +
          member.fine +
          member.unPaidFee
        }円`
      );
    }
    //今回の料金を未払金に追加
    batchUpdateUnpaidFees(
      members.map((member) => ({
        lineId: member.lineId,
        unPaidFee:
          member.unPaidFee +
          member.studyFee +
          member.performanceFee +
          member.fine,
      }))
    );
    //バンド削除
    for (const band of bands) {
      await deleteBand(band.bandId);
    }
    //予約を削除
    for (const reservation of reservations) {
      await deleteReservation(reservation.id);
      await deleteReservationKinjyou(reservation.id);
    }
  };
  return (
    <div>
      <h2 className="text-lg text-center mb-2">先に料金計算をしてください</h2>
      <h2 className="text-sm mb-2">このボタンを押すと以下が実行されます</h2>
      <ul className="list-disc pl-5 mb-2">
        <li className="text-sm">料金を通知</li>
        <li className="text-sm">罰金,学スタ使用料,出演費を未払金に追加</li>
        <li className="text-sm">バンド全削除</li>
        <li className="text-sm">指定した期間の予約削除</li>
        <li className="text-sm">予約データをテキストファイルに保存</li>
        <li className="text-sm">予約データをクリップボードにコピー</li>
      </ul>
      <h2 className="mb-2">料金を計算した期間を入力</h2>
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

      <div className="flex justify-around mb-2">
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
      <div className="flex justify-center my-2 items-center">
        <button
          className="bg-gray-300 rounded p-1 w-24 text-lg"
          onClick={() => handleConf()}
        >
          料金確定
        </button>
      </div>
    </div>
  );
};

export default PriceConf;
