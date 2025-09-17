import { Reservation, Member } from "../types/type";
import EventEmitter from "eventemitter3";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

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
 * メンバー料金情報をExcelファイルでダウンロードする関数
 */
export const downloadMembersExcel = (members: Member[]): void => {
  // ふりがな順でソート
  const sortedMembers = sortMembersByFurigana(members);
  
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
  
  // ワークシートを作成
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // ワークブックを作成
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '料金一覧');
  
  // ファイル名を生成（現在の日付を使用）
  const today = new Date().toISOString().split('T')[0];
  const filename = `料金一覧_${today}.xlsx`;
  
  // ファイルをダウンロード
  XLSX.writeFile(workbook, filename);
};


