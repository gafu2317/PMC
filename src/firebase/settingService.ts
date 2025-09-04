// userService.ts
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  deleteDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { getDayIndex, getTimeIndex, getTimeIndexKinjyou } from "../utils/utils";
import { Member, Reservation, Band } from "../types/type";

// パスワードを変更する関数
export const changePassword = async (newPassword: string): Promise<void> => {
  try {
    const docRef = doc(db, "setting", "password");
    await setDoc(docRef, { password: newPassword });
    console.log("パスワードが変更されました。");
  } catch (error) {
    console.error("パスワードの変更に失敗しました:", error);
  }
};

// パスワードを取得する関数
export const getPassword = async (): Promise<string | undefined> => {
  try {
    const passwordDocRef = doc(db, "setting", "password");
    const passwordDocSnap = await getDoc(passwordDocRef);
    return passwordDocSnap.data()?.password;
  } catch (error) {
    console.error("パスワードの取得に失敗しました:", error);
  }
};

// 予約禁止期間を設定する関数
export const setReservationBanPeriod = async (
  startDate: Date,
  endDate: Date,
  isKinjyou: boolean
): Promise<void> => {
  try {
    const docRef = doc(db, "setting", "reservationBanPeriod");

    // 現在の禁止期間を取得
    const banPeriodDocSnap = await getDoc(docRef);
    const existingBanPeriods = banPeriodDocSnap.data()?.periods || []; // 既存の禁止期間を配列として取得

    // 新しい禁止期間を追加
    existingBanPeriods.push({ startDate, endDate, isKinjyou });

    // ドキュメントが存在しない場合は新規作成
    if (!banPeriodDocSnap.exists()) {
      await setDoc(docRef, { periods: existingBanPeriods });
    } else {
      // Firestore に更新
      await updateDoc(docRef, {
        periods: existingBanPeriods,
      });
    }
    console.log("予約禁止期間が設定されました。");
  } catch (error) {
    console.error("予約禁止期間の設定に失敗しました:", error);
  }
};


// 予約禁止期間を取得する関数
export const getReservationBanPeriod = async (): Promise<
  | {
      startDate: Date;
      endDate: Date;
      isKinjyou: boolean;
    }[]
  | undefined
> => {
  try {
    const banPeriodDocRef = doc(db, "setting", "reservationBanPeriod");
    const banPeriodDocSnap = await getDoc(banPeriodDocRef);

    // すべての禁止期間を取得
    const banPeriodsData = banPeriodDocSnap.data()?.periods || [];
    const banPeriods = banPeriodsData.map((period: any) => ({
      startDate: period.startDate.toDate(),
      endDate: period.endDate.toDate(),
      isKinjyou: period.isKinjyou,
    }));

    return banPeriods; // 配列を返す
  } catch (error) {
    console.error("予約禁止期間の取得に失敗しました:", error);
  }
};


// 予約禁止期間を削除する関数
export const deleteReservationBanPeriod = async (
  startDate: Date,
  endDate: Date,
  isKinjyou: boolean
): Promise<void> => {
  try {
    const docRef = doc(db, "setting", "reservationBanPeriod");
    const banPeriodDocSnap = await getDoc(docRef);
    const existingBanPeriods = banPeriodDocSnap.data()?.periods || []; // 既存の禁止期間を配列として取得

    // 指定された禁止期間を削除
    const updatedBanPeriods = existingBanPeriods.filter((period: any) => {
      const periodStart = period.startDate.toDate(); // Firestore の Timestamp から Date に変換
      const periodEnd = period.endDate.toDate(); // Firestore の Timestamp から Date に変換
      return !(
        periodStart.getTime() === startDate.getTime() &&
        periodEnd.getTime() === endDate.getTime() &&
        period.isKinjyou === isKinjyou
      );
    });

    // Firestore に更新
    await updateDoc(docRef, {
      periods: updatedBanPeriods,
    });
    console.log("予約禁止期間が削除されました。");
  } catch (error) {
    console.error("予約禁止期間の削除に失敗しました:", error);
  }
};


//優先権フラグを設定する関数
export const setPriorityFlag = async (priorityFlag: boolean): Promise<void> => {
  try {
    const docRef = doc(db, "setting", "priorityFlag");
    await updateDoc(docRef, { priorityFlag });
    console.log("優先権フラグが設定されました。");
  } catch (error) {
    console.error("優先権フラグの設定に失敗しました:", error);
  }
};

//優先権フラグを取得する関数
export const getPriorityFlag = async (): Promise<boolean | undefined> => {
  try {
    const priorityFlagDocRef = doc(db, "setting", "priorityFlag");
    const priorityFlagDocSnap = await getDoc(priorityFlagDocRef);
    return priorityFlagDocSnap.data()?.priorityFlag;
  } catch (error) {
    console.error("優先権フラグの取得に失敗しました:", error);
  }
};

//２週間予約のフラグを取得する関数
export const getTwoWeeksFlag = async (): Promise<boolean | undefined> => {
  try {
    const twoWeeksFlagDocRef = doc(db, "setting", "twoWeeksFlag");
    const twoWeeksFlagDocSnap = await getDoc(twoWeeksFlagDocRef);
    return twoWeeksFlagDocSnap.data()?.twoWeeksFlag;
  } catch (error) {
    console.error("２週間予約のフラグの取得に失敗しました:", error);
  }
};

//２週間予約のフラグを設定する関数
export const setTwoWeeksFlag = async (twoWeeksFlag: boolean): Promise<void> => {
  try {
    const docRef = doc(db, "setting", "twoWeeksFlag");
    await updateDoc(docRef, { twoWeeksFlag });
    console.log("２週間予約のフラグが設定されました。");
  } catch (error) {
    console.error("２週間予約のフラグの設定に失敗しました:", error);
  }
};