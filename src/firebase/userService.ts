// userService.ts
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { getDayIndex, getTimeIndex } from "../utils/utils";
import { Members, Reservation } from "../types/type";

// ユーザーを追加する関数
export const addUser = async (
  name: string,
  lineId: string,
  studentId: string
): Promise<void> => {
  try {
    // usersドキュメントの参照を取得
    const docRef = doc(db, "users", studentId);

    // ユーザー情報を追加
    await setDoc(docRef, {
      name: name,
      lineId: lineId,
    });
    console.log(`ユーザーが追加されました。`);
  } catch (error) {
    console.error("ユーザーの追加に失敗しました:", error);
  }
};

// ユーザーを削除する関数
export const deleteUser = async (studentId: string): Promise<void> => {
  try {
    // usersのドキュメントの参照を取得
    const docRef = doc(db, "users", studentId);

    // ドキュメントを削除
    await deleteDoc(docRef);

    console.log("ユーザーが削除されました。");
  } catch (error) {
    console.error("ユーザーの削除に失敗しました:", error);
  }
};

// ユーザーの情報を取得する関数
export const getAllUser = async (): Promise<Members[] | undefined> => {
  try {
    const userColRef = collection(db, "users"); //usersコレクションの参照を取得
    const userDocs = await getDocs(userColRef); //コレクション内の全てのドキュメントを取得
    const users = userDocs.docs.map((doc) => ({
      studentId: doc.id,
      name: doc.data().name,
      lineId: doc.data().lineId,
    }));
    return users;
  } catch (error) {
    console.error("ユーザーの取得に失敗しました:", error);
  }
};

//予約を追加する関数
export const addReservation = async (
  reservation: Reservation
): Promise<void> => {
  try {
    //reservationsドキュメントの参照を取得
    const docRef = doc(db, "reservations", reservation.id);

    //予約情報を追加
    await setDoc(docRef, {
      names: reservation.names,
      date: Timestamp.fromDate(reservation.date),
    });
    console.log("予約が追加されました。");
  } catch (error) {
    console.error("予約の追加に失敗しました:", error);
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

// 予約情報を取得する関数
export const getAllReservations = async (): Promise<
  Reservation[] | undefined
> => {
  try {
    const reservationsColRef = collection(db, "reservations"); // reservationsコレクションの参照を取得
    const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

    const reservations = reservationsDocs.docs.map((doc) => ({
      id: doc.id,
      names: doc.data().names,
      date: doc.data().date.toDate(),
      dayIndex: getDayIndex(doc.data().date.toDate()),
      timeIndex: getTimeIndex(doc.data().date.toDate()),
    }));

    return reservations;
  } catch (error) {
    console.error("予約の取得に失敗しました:", error);
  }
};
