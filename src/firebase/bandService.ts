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

//バンドを更新する関数
export const updateBand = async (
  id: string,
  name: string,
  memberIds: string[]
): Promise<void> => {
  try {
    // bandsのドキュメントの参照を取得
    const docRef = doc(db, "bands", id);

    // ドキュメントを更新
    await setDoc(docRef, { name: name, memberIds: memberIds }, { merge: true });

    console.log("バンドが更新されました。");
  } catch (error) {
    console.error("バンドの更新に失敗しました:", error);
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