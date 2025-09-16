import { Reservation, Member } from "../types/type";
import EventEmitter from "eventemitter3";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { showWarning } from "./swal";

// デバッグ用のログ表示関数
const debugLog = (message: string, step: number) => {
  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `[${timestamp}] ステップ${step}: ${message}`;
  
  // コンソールログ
  console.log(logMessage);
  
  // ページ上にも表示（デバッグ用）
  const debugDiv = document.getElementById('debug-log') || (() => {
    const div = document.createElement('div');
    div.id = 'debug-log';
    div.style.cssText = `
      position: fixed; 
      top: 10px; 
      left: 10px; 
      background: rgba(0,0,0,0.8); 
      color: white; 
      padding: 10px; 
      max-width: 300px; 
      max-height: 400px; 
      overflow-y: auto; 
      font-size: 12px; 
      z-index: 9999;
      border-radius: 5px;
    `;
    document.body.appendChild(div);
    return div;
  })();
  
  debugDiv.innerHTML += `<div>${logMessage}</div>`;
  debugDiv.scrollTop = debugDiv.scrollHeight;
};

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
 * メンバー料金情報をExcelファイルでダウンロードする関数（詳細デバッグ版）
 */
export const downloadMembersExcel = async (members: Member[]): Promise<void> => {
  try {
    debugLog("ダウンロード開始: データ準備中...", 1);
    
    // ふりがな順でソート
    const sortedMembers = sortMembersByFurigana(members);
    debugLog(`ソート完了: ${sortedMembers.length}件のメンバー`, 2);
    
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
    debugLog("Excelデータ準備完了", 3);
    
    // ワークシートを作成
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    debugLog("ワークシート作成完了", 4);
    
    // ワークブックを作成
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '料金一覧');
    debugLog("ワークブック作成完了", 5);
    
    // ファイル名を生成（現在の日付を使用）
    const today = new Date().toISOString().split('T')[0];
    const filename = `料金一覧_${today}.xlsx`;
    debugLog(`ファイル名: ${filename}`, 6);
    
    // モバイル端末の判定
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    debugLog(`デバイス判定: ${isMobile ? 'モバイル' : 'デスクトップ'}`, 7);
    
    if (isMobile) {
      debugLog("モバイル端末検出: 複数の方式を順番に試行", 8);
      
      try {
        const workbookOut = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array'
        });
        debugLog("バイナリデータ生成完了", 9);
        
        const blob = new Blob([workbookOut], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        debugLog(`Blob作成完了: ${blob.size}バイト`, 10);
        
        // 方法1: 新しいタブで開く方式をスキップ（LIFFアプリでは制限されるため）
        debugLog("方法1: 新しいタブで開く方式をスキップ（LIFFアプリでは制限されるため）", 11);
        
        // LIFFアプリでは window.open が偽の成功を返すことがあるため、この方法をスキップ
        
        // 直接CSVデータをクリップボードにコピーする方式（LIFFアプリに最適化）
        debugLog("LIFF最適化: CSVクリップボードコピー方式を試行", 12);
        try {
          const csvData = generateCSVData(members);
          debugLog("CSVデータ生成完了", 13);
          
          // クリップボードAPIを試行
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(csvData);
            debugLog("クリップボードコピー成功", 14);
            showWarning("CSVデータをクリップボードにコピーしました！メモ帳やExcelに貼り付けてください。");
            return;
          } else {
            debugLog("クリップボードAPI利用不可 - 手動表示方式を使用", 15);
            showDataInTextArea(csvData);
            return;
          }
        } catch (clipboardError) {
          debugLog(`クリップボードコピー失敗: ${clipboardError instanceof Error ? clipboardError.message : '不明なエラー'}`, 16);
        }
        
        // フォールバック: テキストエリア表示
        debugLog("フォールバック: テキストエリア表示方式", 17);
        try {
          const csvData = generateCSVData(members);
          showDataInTextArea(csvData);
          debugLog("テキストエリア表示完了", 18);
        } catch (textAreaError) {
          debugLog(`テキストエリア表示失敗: ${textAreaError instanceof Error ? textAreaError.message : '不明なエラー'}`, 19);
        }
        
      } catch (manualError) {
        debugLog(`全ての手動方式が失敗: ${manualError instanceof Error ? manualError.message : '不明なエラー'}`, 31);
        debugLog("ブラウザがファイルダウンロードを完全にブロックしています", 32);
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
    debugLog(`全体的なエラー: ${generalError instanceof Error ? generalError.message : '不明なエラー'}`, 36);
  }
  
  // LIFFアプリ内ブラウザの場合の追加対策
  debugLog("処理完了 - LINEアプリ内ブラウザの制限によりダウンロードが失敗する可能性があります", 37);
  
  // 最終的なフォールバック（上記で処理されなかった場合）
  debugLog("最終フォールバック処理", 20);
};

/**
 * CSVデータを生成する関数
 */
const generateCSVData = (members: Member[]): string => {
  const sortedMembers = sortMembersByFurigana(members);
  
  const csvData = [
    // ヘッダー行
    '名前,ふりがな,罰金,出演費,学スタ使用料,未払金,合計',
    // データ行
    ...sortedMembers.map(member => 
      [
        `"${member.name}"`,
        `"${member.furigana}"`,
        member.fine,
        member.performanceFee,
        member.studyFee,
        member.unPaidFee,
        member.fine + member.performanceFee + member.studyFee + member.unPaidFee
      ].join(',')
    )
  ].join('\n');
  
  return csvData;
};

/**
 * テキストエリアでデータを表示する関数（クリップボードが使えない場合）
 */
const showDataInTextArea = (csvData: string): void => {
  // 既存のテキストエリアを削除
  const existingTextArea = document.getElementById('csv-data-display');
  if (existingTextArea) {
    existingTextArea.remove();
  }
  
  // 新しいテキストエリアを作成
  const textArea = document.createElement('textarea');
  textArea.id = 'csv-data-display';
  textArea.value = csvData;
  textArea.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    height: 70%;
    z-index: 10000;
    background: white;
    border: 2px solid #333;
    padding: 10px;
    font-family: monospace;
    font-size: 12px;
  `;
  
  // 閉じるボタンを作成
  const closeButton = document.createElement('button');
  closeButton.textContent = '✕ 閉じる';
  closeButton.style.cssText = `
    position: absolute;
    top: 5px;
    right: 5px;
    background: #ff4444;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 3px;
  `;
  
  closeButton.onclick = () => {
    document.body.removeChild(textArea);
  };
  
  textArea.appendChild(closeButton);
  document.body.appendChild(textArea);
  
  // テキストを全選択
  textArea.select();
  textArea.setSelectionRange(0, 99999); // モバイル対応
  
  showWarning("データを手動でコピーしてください。長押しで全選択→コピーができます。");
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
