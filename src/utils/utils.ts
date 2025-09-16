import { Reservation, Member } from "../types/type";
import EventEmitter from "eventemitter3";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { showWarning } from "./swal";

export const emitter = new EventEmitter();

let baseDate = new Date();

const currentDay = baseDate.getDay() === 0 ? 6 : baseDate.getDay() - 1; // 月曜日を0とする

export const getBaseDate = () => baseDate;

export const setBaseDate = (newDate: Date) => {
  baseDate = newDate;
  emitter.emit("baseDateChanged");
};

//今週の日付の配列
export const getWeekDays = (baseDate:Date) => {
  return Array.from({ length: 8 }, (_, index) => {
    const date = new Date(baseDate);
    // 今日の日付-今日の月曜日からの日数 = 今週の月曜日
    // 今週の月曜日　+ index = 今週の日付の配列
    date.setDate(baseDate.getDate() - currentDay + index);
    // 月/日の形式で返す(割り算ではない)
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  });
};

export const useWeekDays = () => {
  const [weekDays, setWeekDays] = useState(getWeekDays(baseDate));

  useEffect(() => {
    const handleBaseDateChange = () => {
      setWeekDays(getWeekDays(baseDate));
    };

    emitter.on("baseDateChanged", handleBaseDateChange);

    return () => {
      emitter.off("baseDateChanged", handleBaseDateChange);
    };
  }, []);

  return weekDays;
};

//dayの配列
export const daysOfWeek = ["月", "火", "水", "木", "金", "土", "日", "月"];
//timeの配列
export const timeSlots = [
  "9:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:30",
];
export const timeEndSlots = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:30",
];
export const slots = [
  "9:00~10:00",
  "10:00~11:00",
  "11:00~12:00",
  "12:00~13:00",
  "13:00~14:00",
  "14:00~15:00",
  "15:00~16:00",
  "16:00~17:00",
  "17:00~18:00",
  "18:00~19:00",
  "19:00~20:00",
  "20:00~21:30",
];

export const timeSlotsKinjyou = [
  "9:10",
  "10:55",
  "12:25",
  "13:20",
  "15:05",
  "16:45",
  "18:30",
];
export const timeEndSlotsKinjyou = [
  "10:40",
  "12:25",
  "13:20",
  "14:45",
  "16:35",
  "18:15",
  "19:30",
];

export const slotsKinjyou = ["1限", "2限", "昼", "3限", "4限", "5限", "夜"];

export function getHour(slot: string): number {
  switch (slot) {
    case "1限":
      return 9;
    case "2限":
      return 10;
    case "昼":
      return 12;
    case "3限":
      return 13;
    case "4限":
      return 15;
    case "5限":
      return 16;
    case "夜":
      return 18;
    default:
      return -1;
  }
}

export function getLength(slot: string): number {
  switch (slot) {
    case "1限":
      return 0;
    case "2限":
      return 1;
    case "昼":
      return 2;
    case "3限":
      return 3;
    case "4限":
      return 4;
    case "5限":
      return 5;
    case "夜":
      return 6;
    default:
      return -1;
  }
}

export function getDayIndex(
  weekDays: {
    date: string; // "月/日" の形式
    day: number; // 日
    month: number; // 月
    year: number; // 年
  }[],
  date: Date
): number {
  for (let i = 0; i < weekDays.length; i++) {
    if (
      weekDays[i].day === date.getDate() &&
      weekDays[i].month === date.getMonth() + 1 &&
      weekDays[i].year === date.getFullYear()
    ) {
      const dayIndex = i;
      return dayIndex;
    }
  }
  return -1;
}

export function getTimeIndex(date: Date): number {
  for (let i = 0; i < timeSlots.length; i++) {
    const hour = parseInt(timeSlots[i].split(":")[0], 10); // 文字列を数値に変換
    if (hour === date.getHours()) {
      const timeIndex = i;
      return timeIndex;
    }
  }
  return -1;
}
export function getTimeIndexKinjyou(date: Date): number {
  for (let i = 0; i < timeSlotsKinjyou.length; i++) {
    const hour = parseInt(timeSlotsKinjyou[i].split(":")[0], 10); // 文字列を数値に変換
    if (hour === date.getHours()) {
      const timeIndex = i;
      return timeIndex;
    }
  }
  return -1;
}

export function isReservationExist(
  reservations: Reservation[],
  hours: boolean[][]
): boolean {
  for (let i = 0; i < hours.length; i++) {
    for (let j = 0; j < hours[i].length; j++) {
      if (hours[i][j]) {
        for (let k = 0; k < reservations.length; k++) {
          if (
            reservations[k].dayIndex === i &&
            reservations[k].timeIndex === j
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

export function isDuplicate(reservations: Reservation[]) {
  const updatedIsDuplicates = Array.from({ length: 8 }, () =>
    Array(12).fill(false)
  );
  const reservationCounts = Array.from({ length: 8 }, () => Array(12).fill(0));
  reservations.forEach((reservation) => {
    reservationCounts[reservation.dayIndex][reservation.timeIndex] += 1;
  });
  reservations.forEach((reservation) => {
    if (reservationCounts[reservation.dayIndex][reservation.timeIndex] > 1) {
      updatedIsDuplicates[reservation.dayIndex][reservation.timeIndex] = true;
    }
  });
  return updatedIsDuplicates;
}

/**
 * ふりがなで50音順にメンバーをソートする関数
 */
export const sortMembersByFurigana = (members: Member[]): Member[] => {
  return [...members].sort((a, b) => {
    // ふりがなでソート（空の場合は名前でソート）
    const furiganaA = a.furigana || a.name;
    const furiganaB = b.furigana || b.name;
    return furiganaA.localeCompare(furiganaB, 'ja', { 
      numeric: true, 
      sensitivity: 'base' 
    });
  });
};

/**
 * メンバー料金情報をExcelファイルでダウンロードする関数（デバッグ版）
 */
export const downloadMembersExcel = (members: Member[]): void => {
  try {
    showWarning("ダウンロード開始: データ準備中...");
    
    // ふりがな順でソート
    const sortedMembers = sortMembersByFurigana(members);
    showWarning(`ソート完了: ${sortedMembers.length}件のメンバー`);
    
    // Excelデータの準備
    const worksheetData = [
      // ヘッダー行
      ['名前', 'ふりがな', '罰金', '出演費', '学スタ使用料', '未払金', '合計'],
      // データ行
      ...sortedMembers.map(member => [
        member.name,
        member.furigana,
        member.fine,
        member.performanceFee,
        member.studyFee,
        member.unPaidFee,
        member.fine + member.performanceFee + member.studyFee + member.unPaidFee
      ])
    ];
    showWarning("Excelデータ準備完了");
    
    // ワークシートを作成
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    showWarning("ワークシート作成完了");
    
    // ワークブックを作成
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '料金一覧');
    showWarning("ワークブック作成完了");
    
    // ファイル名を生成（現在の日付を使用）
    const today = new Date().toISOString().split('T')[0];
    const filename = `料金一覧_${today}.xlsx`;
    showWarning(`ファイル名: ${filename}`);
    
    // モバイル端末の判定
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      showWarning("モバイル端末検出: 手動ダウンロード方式を使用");
      
      try {
        // モバイルの場合は最初から手動ダウンロードを使用
        const workbookOut = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array'
        });
        showWarning("バイナリデータ生成完了");
        
        const blob = new Blob([workbookOut], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        showWarning(`Blob作成完了: ${blob.size}バイト`);
        
        // ダウンロード用のリンク要素を作成
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        showWarning("ObjectURL作成完了");
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        showWarning("リンク要素設定完了");
        
        // ユーザーがクリックしたタイミングで実行するため、少し待つ
        setTimeout(() => {
          document.body.appendChild(link);
          showWarning("リンクをDOMに追加");
          
          link.click();
          showWarning("リンククリック実行");
          
          // クリーンアップ
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showWarning("手動ダウンロード完了！クリーンアップ済み");
          }, 100);
        }, 100);
        
      } catch (manualError) {
        showWarning(`手動ダウンロード失敗: ${manualError instanceof Error ? manualError.message : '不明なエラー'}`);
        showWarning("ブラウザがファイルダウンロードをブロックしている可能性があります");
      }
      
    } else {
      // デスクトップの場合は標準ダウンロードを試す
      try {
        showWarning("デスクトップ端末: 標準ダウンロード方式を試行中...");
        XLSX.writeFile(workbook, filename);
        showWarning("標準ダウンロード成功！");
      } catch (error) {
        showWarning(`標準ダウンロード失敗: ${error instanceof Error ? error.message : '不明なエラー'}`);
        showWarning("手動ダウンロード方式に切り替え中...");
        
        try {
          const workbookOut = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array'
          });
          showWarning("バイナリデータ生成完了");
          
          const blob = new Blob([workbookOut], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          showWarning(`Blob作成完了: ${blob.size}バイト`);
          
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          showWarning("ObjectURL作成完了");
          
          link.href = url;
          link.download = filename;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          showWarning("手動ダウンロード完了！");
          
        } catch (manualError) {
          showWarning(`手動ダウンロードも失敗: ${manualError instanceof Error ? manualError.message : '不明なエラー'}`);
        }
      }
    }
    
  } catch (generalError) {
    showWarning(`全体的なエラー: ${generalError instanceof Error ? generalError.message : '不明なエラー'}`);
  }
};


// /**
//  * テキストファイルを作成してダウンロードする関数
//  * @param content テキストファイルの内容
//  * @param filename ダウンロードするファイル名
//  */
// export const downloadTextFile = (content: string, filename: string): void => {
//   // テキストコンテンツからBlobを作成
//   const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  
//   // BlobからURLを生成
//   const url = URL.createObjectURL(blob);
  
//   // ダウンロード用のリンク要素を作成
//   const link = document.createElement('a');
//   link.href = url;
//   link.download = filename;
  
//   // リンクを非表示にする
//   link.style.display = 'none';
  
//   // リンクをDOMに追加
//   document.body.appendChild(link);
  
//   // リンクをクリック（ダウンロード開始）
//   link.click();
  
//   // リンクをDOMから削除
//   document.body.removeChild(link);
  
//   // URLオブジェクトを解放
//   URL.revokeObjectURL(url);
// };
