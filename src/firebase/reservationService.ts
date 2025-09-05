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
import { User, Reservation, Band } from "../types/type";

//予約を追加する関数
export const addReservations = async (
  reservatios: Reservation[]
): Promise<void> => {
  try {
    const batch = writeBatch(db); //バッチ処理を開始
    const docRef = collection(db, "reservations"); //reservationsコレクションの参照を取得
    for (const reservation of reservatios) {
      const newDocRef = doc(docRef); //新しいドキュメントの参照を取得
      batch.set(newDocRef, {
        names: reservation.names,
        date: Timestamp.fromDate(reservation.date),
      });
    }
    await batch.commit(); //バッチ処理を実行
    console.log("予約が追加されました。");
  } catch (error) {
    console.error("予約の追加に失敗しました:", error);
  }
};
//予約を追加する関数
export const addReservationsKinjyou = async (
  reservatios: Reservation[]
): Promise<void> => {
  try {
    const batch = writeBatch(db); //バッチ処理を開始
    const docRef = collection(db, "reservationsKinjyou"); //reservationsコレクションの参照を取得
    for (const reservation of reservatios) {
      const newDocRef = doc(docRef); //新しいドキュメントの参照を取得
      batch.set(newDocRef, {
        names: reservation.names,
        date: Timestamp.fromDate(reservation.date),
      });
    }
    await batch.commit(); //バッチ処理を実行
    console.log("予約が追加されました。");
  } catch (error) {
    console.error("予約の追加に失敗しました:", error);
  }
};

//管理者メニューで予約を追加する関数
export const addReservationsAdmin = async (
  reservatios: { names: string[]; date: Date }[]
): Promise<void> => {
  try {
    const batch = writeBatch(db); //バッチ処理を開始
    const docRef = collection(db, "reservations"); //reservationsコレクションの参照を取得
    for (const reservation of reservatios) {
      const newDocRef = doc(docRef); //新しいドキュメントの参照を取得
      batch.set(newDocRef, {
        names: reservation.names,
        date: Timestamp.fromDate(reservation.date),
      });
    }
    await batch.commit(); //バッチ処理を実行
    console.log("予約が追加されました。");
  } catch (error) {
    console.error("予約の追加に失敗しました:", error);
  }
};
//管理者メニューで予約を追加する関数
export const addReservationsAdminKinjyou = async (
  reservatios: { names: string[]; date: Date }[]
): Promise<void> => {
  try {
    const batch = writeBatch(db); //バッチ処理を開始
    const docRef = collection(db, "reservationsKinjyou"); //reservationsコレクションの参照を取得
    for (const reservation of reservatios) {
      const newDocRef = doc(docRef); //新しいドキュメントの参照を取得
      batch.set(newDocRef, {
        names: reservation.names,
        date: Timestamp.fromDate(reservation.date),
      });
    }
    await batch.commit(); //バッチ処理を実行
    console.log("予約が追加されました。");
  } catch (error) {
    console.error("予約の追加に失敗しました:", error);
  }
};

// 予約を更新する関数
export const updateReservation = async (
  id: string,
  names: string[]
): Promise<void> => {
  try {
    // reservationsのドキュメントの参照を取得
    const docRef = doc(db, "reservations", id);

    // ドキュメントを更新
    await setDoc(docRef, { names: names }, { merge: true });

    console.log("予約が更新されました。");
  } catch (error) {
    console.error("予約の更新に失敗しました:", error);
  }
};
// 予約を更新する関数
export const updateReservationKinjyou = async (
  id: string,
  names: string[]
): Promise<void> => {
  try {
    // reservationsのドキュメントの参照を取得
    const docRef = doc(db, "reservationsKinjyou", id);

    // ドキュメントを更新
    await setDoc(docRef, { names: names }, { merge: true });

    console.log("予約が更新されました。");
  } catch (error) {
    console.error("予約の更新に失敗しました:", error);
  }
};

// 予約を削除する関数
export const deleteReservation = async (id: string): Promise<void> => {
  try {
    // reservationsのドキュメントの参照を取得
    const docRef = doc(db, "reservations", id);

    // ドキュメントを削除
    await deleteDoc(docRef);

    console.log("予約が削除されました。");
  } catch (error) {
    console.error("予約の削除に失敗しました:", error);
  }
};
// 予約を削除する関数
export const deleteReservationKinjyou = async (id: string): Promise<void> => {
  try {
    // reservationsのドキュメントの参照を取得
    const docRef = doc(db, "reservationsKinjyou", id);

    // ドキュメントを削除
    await deleteDoc(docRef);

    console.log("予約が削除されました。");
  } catch (error) {
    console.error("予約の削除に失敗しました:", error);
  }
};

// 予約情報を取得する関数
export const getAllReservations = async (
  weekDays: {
    date: string; // "月/日" の形式
    day: number; // 日
    month: number; // 月
    year: number; // 年
  }[]
): Promise<Reservation[] | undefined> => {
  try {
    const reservationsColRef = collection(db, "reservations"); // reservationsコレクションの参照を取得
    const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

    const reservations = reservationsDocs.docs
      .filter((doc) => {
        // dateフィールドが存在し、有効なTimestampかチェック
        const dateField = doc.data().date;
        return dateField && typeof dateField.toDate === "function";
      })
      .map((doc) => ({
        id: doc.id,
        names: doc.data().names,
        date: doc.data().date.toDate(),
        dayIndex: getDayIndex(weekDays, doc.data().date.toDate()),
        timeIndex: getTimeIndex(doc.data().date.toDate()),
      }))
      .filter(
        (reservation) =>
          reservation.dayIndex !== -1 && reservation.timeIndex !== -1
      );

    return reservations;
  } catch (error) {
    console.error("予約の取得に失敗しました:", error);
  }
};
// 予約情報を取得する関数
export const getAllReservationsKinjyou = async (
  weekDays: {
    date: string; // "月/日" の形式
    day: number; // 日
    month: number; // 月
    year: number; // 年
  }[]
): Promise<Reservation[] | undefined> => {
  try {
    const reservationsColRef = collection(db, "reservationsKinjyou"); // reservationsコレクションの参照を取得
    const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

    const reservations = reservationsDocs.docs
      .filter((doc) => {
        // dateフィールドが存在し、有効なTimestampかチェック
        const dateField = doc.data().date;
        return dateField && typeof dateField.toDate === "function";
      })
      .map((doc) => ({
        id: doc.id,
        names: doc.data().names,
        date: doc.data().date.toDate(),
        dayIndex: getDayIndex(weekDays, doc.data().date.toDate()),
        timeIndex: getTimeIndexKinjyou(doc.data().date.toDate()),
      }))
      .filter(
        (reservation) =>
          reservation.dayIndex !== -1 && reservation.timeIndex !== -1
      );

    return reservations;
  } catch (error) {
    console.error("予約の取得に失敗しました:", error);
  }
};

//指定した期間の予約を取得する関数(dayIndexとtimeIndexなし)
export const getReservationsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<{ id: string; names: string[]; date: Date }[]> => {
  try {
    const reservationsColRef = collection(db, "reservations"); // reservationsコレクションの参照を取得
    const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

    const reservations = reservationsDocs.docs
      .filter((doc) => {
        // dateフィールドが存在し、有効なTimestampかチェック
        const dateField = doc.data().date;
        return dateField && typeof dateField.toDate === "function";
      })
      .map((doc) => ({
        id: doc.id,
        names: doc.data().names,
        date: doc.data().date.toDate(),
      }))
      .filter(
        (reservation) =>
          reservation.date >= startDate &&
          reservation.date <= endDate.setHours(23, 59, 59, 999) // 終了日の時間を23:59:59に設定
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return reservations;
  } catch (error) {
    return [];
  }
};
//指定した期間の予約を取得する関数(dayIndexとtimeIndexなし)
export const getReservationsByDateRangeKnjyou = async (
  startDate: Date,
  endDate: Date
): Promise<{ id: string; names: string[]; date: Date }[]> => {
  try {
    const reservationsColRef = collection(db, "reservationsKinjyou"); // reservationsコレクションの参照を取得
    const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

    const reservations = reservationsDocs.docs
      .filter((doc) => {
        // dateフィールドが存在し、有効なTimestampかチェック
        const dateField = doc.data().date;
        return dateField && typeof dateField.toDate === "function";
      })
      .map((doc) => ({
        id: doc.id,
        names: doc.data().names,
        date: doc.data().date.toDate(),
      }))
      .filter(
        (reservation) =>
          reservation.date >= startDate &&
          reservation.date <= endDate.setHours(23, 59, 59, 999) // 終了日の時間を23:59:59に設定
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return reservations;
  } catch (error) {
    return [];
  }
};

//全ての期間の予約を取得する関数(dayIndexとtimeIndexなし)
export const getAllPeriodReservations = async (): Promise<
  { id: string; names: string[]; date: Date }[]
> => {
  try {
    const reservationsColRef = collection(db, "reservations"); // reservationsコレクションの参照を取得
    const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

    const reservations = reservationsDocs.docs
      .filter((doc) => {
        // dateフィールドが存在し、有効なTimestampかチェック
        const dateField = doc.data().date;
        return dateField && typeof dateField.toDate === "function";
      })
      .map((doc) => ({
        id: doc.id,
        names: doc.data().names,
        date: doc.data().date.toDate(),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return reservations;
  } catch (error) {
    return [];
  }
};
//全ての期間の予約を取得する関数(dayIndexとtimeIndexなし)
export const getAllPeriodReservationsKinjyou = async (): Promise<
  { id: string; names: string[]; date: Date }[]
> => {
  try {
    const reservationsColRef = collection(db, "reservationsKinjyou"); // reservationsコレクションの参照を取得
    const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

    const reservations = reservationsDocs.docs
      .filter((doc) => {
        // dateフィールドが存在し、有効なTimestampかチェック
        const dateField = doc.data().date;
        return dateField && typeof dateField.toDate === "function";
      })
      .map((doc) => ({
        id: doc.id,
        names: doc.data().names,
        date: doc.data().date.toDate(),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return reservations;
  } catch (error) {
    return [];
  }
};