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
  const [fileFormat, setFileFormat] = useState<"csv" | "txt">("txt"); // ファイル形式の選択状態

  const filteredMembers = members.filter((member) =>
    member.name.includes(searchTerm)
  );

  // CSVデータを生成する関数
  const generateCSV = (reservations: { id: string; names: string[]; date: Date }[]) => {
    // ヘッダー行
    let csvContent = "これは料金があっているかを確認するためのファイルです\n日付は開始時刻を表し１コマ単位で処理しています\n予約ID,日付,参加者\n";
    
    // 予約情報
    reservations.forEach(reservation => {
      const date = reservation.date instanceof Date 
        ? `${reservation.date.toLocaleDateString()} ${reservation.date.toLocaleTimeString()}`
        : `${new Date(reservation.date).toLocaleDateString()} ${new Date(reservation.date).toLocaleTimeString()}`;
      csvContent += `${reservation.id},${date},"${reservation.names.join(', ')}"\n`;
    });
    
    return csvContent;
  };

  // テキストデータを生成する関数
  const generateText = (reservations: { id: string; names: string[]; date: Date }[]) => {
    // テキスト形式のヘッダー
    let textContent =
      "これは料金があっているかを確認するためのファイルです\n日付は開始時刻を表し１コマ単位で処理しています\n予約情報\n";
    textContent += "===================\n\n";
    
    // 予約情報
    reservations.forEach(reservation => {
      const date = reservation.date instanceof Date 
        ? `${reservation.date.toLocaleDateString()} ${reservation.date.toLocaleTimeString()}`
        : `${new Date(reservation.date).toLocaleDateString()} ${new Date(reservation.date).toLocaleTimeString()}`;
      textContent += `日付: ${date}\n`;
      textContent += `参加者: ${reservation.names.join(', ')}\n`;
      textContent += "-------------------\n";
    });
    
    return textContent;
  };

  // ファイルをダウンロードする関数
  const downloadFile = (reservations: { id: string; names: string[]; date: Date }[]) => {
    if (reservations.length === 0) {
      showError("予約データがありません");
      return;
    }
    
    // 選択された形式に基づいてデータを生成
    const content = fileFormat === "csv" ? generateCSV(reservations) : generateText(reservations);
    const mimeType = fileFormat === "csv" ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // 日付範囲をファイル名に含める
    let fileName = "予約情報";
    if (!isAll && startDate && endDate) {
      fileName += `_${startDate}_${endDate}`;
    }
    fileName += fileFormat === "csv" ? ".csv" : ".txt";
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

const handleRoundUp = async () => {
  try {
    // 各メンバーの料金を10円単位に繰り上げして更新データを準備
    const updates = members.map((member) => {
      const roundUpPrice = (price: number) => Math.ceil(price / 10) * 10;
      
      return {
        lineId: member.lineId,
        fine: roundUpPrice(member.fine),
        performanceFee: roundUpPrice(member.performanceFee),
        studyFee: roundUpPrice(member.studyFee),
      };
    });

    // 一括更新を実行
    await updateMemberFees(updates);
    showSuccess("料金の下1桁繰り上げが完了しました");
    
  } catch (error) {
    showError("料金の繰り上げに失敗しました");
    console.error(error);
  }
};

  const handleCalculate = async () => {
    // 予約を取得
    let fetchedReservations: {
      id: string;
      names: string[];
      date: Date;
    }[] = [];
    
    try {
      if (isAll) {
        const reservationsMeikou = await getAllPeriodReservations();
        const reservationsKinjyou = await getAllPeriodReservationsKinjyou();
        fetchedReservations = [...reservationsMeikou, ...reservationsKinjyou];
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
          fetchedReservations = [...reservationsMeikou, ...reservationsKinjyou];
        } else {
          showError("予約を取得する期間を選択してください");
          return;
        }
      }

      // 学スタ料金を計算
      // メンバーごとの料金計算用のマップを作成
      const memberFees: { [key: string]: number } = {};

      // 各予約について処理
      fetchedReservations.forEach((reservation) => {
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

      // 一括更新を実行（studyFeeとperformanceFeeの両方を更新）
      await updateMemberFees(updates);
      showSuccess(`料金計算が完了しました`);
      
      // 料金計算が完了したら自動的にファイルをダウンロード
      downloadFile(fetchedReservations);
      
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

      <div className="flex justify-around mt-2 mb-2">
        <button
          className={`text-sm rounded p-1 ${
            fileFormat === "csv" ? "bg-green-400" : "bg-gray-300"
          }`}
          onClick={() => setFileFormat("csv")}
        >
          CSV形式
        </button>
        <button
          className={`text-sm rounded p-1 ${
            fileFormat === "txt" ? "bg-green-400" : "bg-gray-300"
          }`}
          onClick={() => setFileFormat("txt")}
        >
          テキスト形式
        </button>
      </div>
      
      <div className="flex justify-end my-2 items-center">
        <button
          className="bg-gray-300 rounded p-1 w-20"
          onClick={() => handleCalculate()}
        >
          料金計算
        </button>
      </div>

      <div className="flex justify-end my-2 items-center">
        <button
          className="bg-gray-300 rounded p-1 w-44"
          onClick={() => handleRoundUp()}
        >
          料金の下1桁を繰上げ
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
