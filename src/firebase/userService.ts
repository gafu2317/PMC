// userService.ts
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { getDayIndex, getTimeIndex } from "../utils/utils";
import { Member, Reservation, Band } from "../types/type";

// ユーザーを追加する関数
export const addUser = async (
  name: string,
  lineId: string,
  studentId: string
): Promise<void> => {
  try {
    // usersドキュメントの参照を取得
    const docRef = doc(db, "users", lineId);

    // ユーザー情報を追加
    await setDoc(docRef, {
      name: name,
      studentId: studentId,
    });
    console.log(`ユーザーが追加されました。`);
  } catch (error) {
    console.error("ユーザーの追加に失敗しました:", error);
  }
};

// ユーザーを削除する関数
export const deleteUser = async (lineId: string): Promise<void> => {
  try {
    // usersのドキュメントの参照を取得
    const docRef = doc(db, "users", lineId);

    // ドキュメントを削除
    await deleteDoc(docRef);

    console.log("ユーザーが削除されました。");
  } catch (error) {
    console.error("ユーザーの削除に失敗しました:", error);
  }
};

// ユーザーの情報を取得する関数
export const getAllUser = async (): Promise<Member[] | undefined> => {
  try {
    const userColRef = collection(db, "users"); //usersコレクションの参照を取得
    const userDocs = await getDocs(userColRef); //コレクション内の全てのドキュメントを取得
    const users = userDocs.docs.map((doc) => ({
      lineId: doc.id,
      name: doc.data().name,
      studentId: doc.data().studentId,
    }));
    return users;
  } catch (error) {
    console.error("ユーザーの取得に失敗しました:", error);
  }
};

//予約を追加する関数
export const addReservation = async (
  reservatios: Reservation[]
): Promise<void> => {
  try {
    const docRef = collection(db, "reservations"); //reservationsコレクションの参照を取得
    for (const reservation of reservatios) {
      //予約情報を追加
      await addDoc(docRef, {
        names: reservation.names,
        date: Timestamp.fromDate(reservation.date),
      });
    }
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

// 予約情報を取得する関数
export const getAllReservations = async (): Promise<
  Reservation[] | undefined
> => {
  try {
    const reservationsColRef = collection(db, "reservations"); // reservationsコレクションの参照を取得
    const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1); // 一年前の日付を計算

    const oldReservations = reservationsDocs.docs.filter((doc) => {
      const reservationDate = doc.data().date.toDate(); // Firestoreの日付をJavaScriptのDateオブジェクトに変換
      return reservationDate < oneYearAgo; // 一年前より古い予約をフィルタリング
    });

    // 古い予約を削除
    for (const oldDoc of oldReservations) {
      await deleteReservation(oldDoc.id);
    }

    const reservations = reservationsDocs.docs
      .map((doc) => ({
        id: doc.id,
        names: doc.data().names,
        date: doc.data().date.toDate(),
        dayIndex: getDayIndex(doc.data().date.toDate()),
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

//指定した期間の予約を取得する関数
export const getReservationsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<{ id: string; names: string[]; date: Date }[]> => {
  try {
    const reservationsColRef = collection(db, "reservations"); // reservationsコレクションの参照を取得
    const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

    const reservations = reservationsDocs.docs
      .map((doc) => ({
        id: doc.id,
        names: doc.data().names,
        date: doc.data().date.toDate(),
      }))
      .filter(
        (reservation) =>
          reservation.date >= startDate &&
          reservation.date <= endDate.setHours(23, 59, 59, 999) // 終了日の時間を23:59:59に設定
      );

    return reservations;
  } catch (error) {
    console.error("予約の取得に失敗しました:", error);
    return [];
  }
};

//全ての期間の予約を取得する関数
export const getAllPeriodReservations = async (): Promise<
  { id: string; names: string[]; date: Date }[]
> => {
  try {
    const reservationsColRef = collection(db, "reservations"); // reservationsコレクションの参照を取得
    const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

    const reservations = reservationsDocs.docs.map((doc) => ({
      id: doc.id,
      names: doc.data().names,
      date: doc.data().date.toDate(),
    }));

    return reservations;
  } catch (error) {
    console.error("予約の取得に失敗しました:", error);
    return [];
  }
};

//　プリセットをユーザーデータに追加する関数(二次元配列のフィールドを持つには二次元配列ごと渡さないといけないっぽい？)
export const addPresets = async (
  lineId: string,
  presetMemberLineIds: string[]
): Promise<void> => {
  try {
    const docRef = doc(db, "users", lineId);
    const docSnap = await getDoc(docRef);
    const presetObj = { members: presetMemberLineIds }; // 新しいプリセットオブジェクト

    // ドキュメントが存在する場合
    if (docSnap.exists()) {
      const existingPresets = docSnap.data().presets || []; // presetsがない場合は空配列を使用

      // 新しいプリセットの重複チェック
      const isDuplicate = existingPresets.some(
        (existingPreset: { members: string[] }) =>
          existingPreset.members.length === presetObj.members.length &&
          existingPreset.members.every((member) =>
            presetObj.members.includes(member)
          )
      );

      if (!isDuplicate) {
        // 重複がなければプリセットを追加
        await setDoc(
          docRef,
          { presets: [...existingPresets, presetObj] },
          { merge: true }
        );
        console.log("プリセットが追加されました。");
      } else {
        console.log("重複するプリセットは追加されませんでした。");
      }
    } else {
      // ドキュメントが存在しない場合、新しく作成
      await setDoc(docRef, { presets: [presetObj] }, { merge: true });
      console.log(
        "新しいユーザーのドキュメントを作成し、プリセットが追加されました。"
      );
    }
  } catch (error) {
    console.error("プリセットの追加に失敗しました:", error);
  }
};

// プリセットを削除する関数
export const deletePresets = async (
  lineId: string,
  presetMemberLineIds: string[]
): Promise<void> => {
  //presetと一致するものを削除
  try {
    const docRef = doc(db, "users", lineId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const existingPresets = docSnap.data().presets || [];
      const newPresets = existingPresets.filter(
        (existingPreset: { members: string[] }) =>
          existingPreset.members.length !== presetMemberLineIds.length ||
          !existingPreset.members.every((member) =>
            presetMemberLineIds.includes(member)
          )
      );
      await setDoc(docRef, { presets: newPresets }, { merge: true });
      console.log("プリセットが削除されました。");
    } else {
      console.log("指定されたユーザーのドキュメントは存在しません。");
    }
  } catch (error) {
    console.error("プリセットの削除に失敗しました:", error);
  }
};

// プリセットを取得する関数
export const getPresets = async (
  lineId: string
): Promise<string[][] | undefined> => {
  try {
    const userDocRef = doc(db, "users", lineId); // usersドキュメントの参照を取得
    const userDocSnap = await getDoc(userDocRef); // ドキュメントのスナップショットを取得

    if (userDocSnap.exists()) {
      const presetObj = userDocSnap.data()?.presets; // データを取得し、presetsを取得
      const presets = presetObj.map(
        (preset: { members: string[] }) => preset.members
      ); // プリセットを二次元配列に変換
      return presets;
    } else {
      console.log("指定されたユーザーのドキュメントは存在しません。");
      return undefined; // ドキュメントが存在しない場合はundefinedを返す
    }
  } catch (error) {
    console.error("プリセットの取得に失敗しました:", error);
    return undefined; // エラー時にundefinedを返す
  }
};

//バンドを追加する関数
export const addBand = async (
  name: string,
  memberIds: string[]
): Promise<void> => {
  try {
    const docRef = collection(db, "bands"); //bandsコレクションの参照を取得
    //バンド情報を追加
    await addDoc(docRef, {
      name: name,
      memberIds: memberIds,
    });
    console.log("バンドが追加されました。");
  } catch (error) {
    console.error("バンドの追加に失敗しました:", error);
  }
};

//バンドを削除する関数
export const deleteBand = async (id: string): Promise<void> => {
  try {
    // bandsのドキュメントの参照を取得
    const docRef = doc(db, "bands", id);

    // ドキュメントを削除
    await deleteDoc(docRef);

    console.log("バンドが削除されました。");
  } catch (error) {
    console.error("バンドの削除に失敗しました:", error);
  }
};

//バンドを取得する関数
export const getAllBands = async (): Promise<Band[] | undefined> => {
  try {
    const bandsColRef = collection(db, "bands"); // bandsコレクションの参照を取得
    const bandsDocs = await getDocs(bandsColRef); // コレクション内の全てのドキュメントを取得

    const bands = bandsDocs.docs.map((doc) => ({
      bandId: doc.id,
      name: doc.data().name,
      memberIds: doc.data().memberIds,
    }));

    return bands;
  } catch (error) {
    console.error("バンドの取得に失敗しました:", error);
  }
};
