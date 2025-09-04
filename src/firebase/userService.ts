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
      fine: 0,
      unPaidFee: 0,
      performanceFee: 0,
      studyFee: 0,
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
export const getAllUser = async (): Promise<Member[]> => {
  try {
    const userColRef = collection(db, "users"); //usersコレクションの参照を取得
    const userDocs = await getDocs(userColRef); //コレクション内の全てのドキュメントを取得
    const users = userDocs.docs.map((doc) => ({
      lineId: doc.id,
      name: doc.data().name || "データなし",
      studentId: doc.data().studentId || 0,
      fine: doc.data().fine || 0,
      unPaidFee: doc.data().unPaidFee || 0,
      performanceFee: doc.data().performanceFee || 0,
      studyFee: doc.data().studyFee || 0,
    }));
    return users;
  } catch (error) {
    console.error("ユーザーの取得に失敗しました:", error);
    return [];
  }
};

// 罰金情報を追加
export const addFine = async (lineId: string, fine: number): Promise<void> => {
  try {
    const docRef = doc(db, "users", lineId);
    await setDoc(docRef, { fine:  fine }, { merge: true });
    console.log("罰金が追加されました。");
  } catch (error) {
    console.error("罰金の追加に失敗しました:", error);
  }
};

// 罰金情報を削除
export const deleteFine = async (lineId: string): Promise<void> => {
  try {
    const docRef = doc(db, "users", lineId);
    await setDoc(docRef, { fine: 0 }, { merge: true });
    console.log("罰金が削除されました。");
  } catch (error) {
    console.error("罰金の削除に失敗しました:", error);
  }
};


// 未払いの料金を上書きする関数
export const addUnpaidFee = async (
  lineId: string,
  unPaidFee: number
): Promise<void> => {
  try {
    if (!lineId) {
      console.error("無効なLine IDです。");
      return;
    }
    const docRef = doc(db, "users", lineId);
    // 未払い料金を上書き
    await setDoc(docRef, { unPaidFee }, { merge: true });
    console.log("未払い料金が上書きされました。");
  } catch (error) {
    console.error("未払い料金の上書きに失敗しました:", error);
  }
};

// 未払いの料金を削除する関数
export const deleteUnpaidFee = async (lineId: string): Promise<void> => {
  try {
    const docRef = doc(db, "users", lineId);
    await setDoc(docRef, { unpaidFee: 0 }, { merge: true });
    console.log("未払い料金が削除されました。");
  } catch (error) {
    console.error("未払い料金の削除に失敗しました:", error);
  }
};


// 複数のユーザーの学スタ使用料、出演費を一度に更新する関数
export const updateMemberFees = async (
  updates: { lineId: string; studyFee: number; performanceFee: number }[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // 各ユーザーの更新をバッチに追加
    updates.forEach(({ lineId, studyFee, performanceFee }) => {
      const docRef = doc(db, "users", lineId);
      batch.set(docRef, { 
        studyFee: studyFee,
        performanceFee: performanceFee 
      }, { merge: true });
    });
    
    // バッチ処理を実行
    await batch.commit();
    console.log(`${updates.length}人のユーザーの料金情報が更新されました。`);
  } catch (error) {
    console.error("料金情報の一括更新に失敗しました:", error);
    throw error;
  }
};

//ユーザーの料金を未払金に追加する関数(その他の料金をゼロにする)
export const batchUpdateUnpaidFees = async (
  updates: { lineId: string; unPaidFee: number }[]
): Promise<void> => {
  try {
    // バッチ処理の初期化
    const batch = writeBatch(db);

    // 各ユーザーの未払金を更新
    for (const update of updates) {
      const userRef = doc(db, "users", update.lineId);

      // 現在のドキュメントを取得して存在確認（オプション）
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        console.warn(`ユーザー ${update.lineId} が存在しません`);
        continue;
      }

      // バッチに更新操作を追加
      batch.update(userRef, { unPaidFee: update.unPaidFee, studyFee: 0, performanceFee: 0, fine: 0 });
    }

    // バッチ処理を実行
    await batch.commit();
    console.log(`${updates.length}人のユーザーの未払金を更新しました`);
  } catch (error) {
    console.error("未払金の一括更新に失敗しました:", error);
    throw error;
  }
};
