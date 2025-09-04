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




// -------------------------------------------------------------------------------
// プリセット関連の関数
// -------------------------------------------------------------------------------

//　プリセットをユーザーデータに追加する関数(二次元配列のフィールドを持つには二次元配列ごと渡さないといけないっぽい？)
export const addPresets = async (
  lineId: string,
  presetMemberLineIds: string[],
  presetName?: string
): Promise<void> => {
  try {
    const docRef = doc(db, "users", lineId);
    const docSnap = await getDoc(docRef);
    // ユニークなIDを生成
    const presetId = `${Date.now()}-${Math.random()}`;
    // プリセットオブジェクトの定義
    const presetObj: { id: string; membersLineIds: string[]; name?: string } = {
      id: presetId, // IDを追加
      membersLineIds: presetMemberLineIds,
    };
    // presetNameが存在する場合にのみ追加
    if (presetName) {
      presetObj.name = presetName;
    }

    // ドキュメントが存在する場合
    if (docSnap.exists()) {
      const existingPresets = docSnap.data().presets || []; // presetsがない場合は空配列を使用
      // 新しいプリセットの重複チェック
      const isDuplicate = existingPresets.some(
        (existingPreset: { membersLineIds: string[]; name?: string }) =>
          existingPreset.membersLineIds.length ===
            presetObj.membersLineIds.length &&
          existingPreset.membersLineIds.every((memberLineIds) =>
            presetObj.membersLineIds.includes(memberLineIds)
          ) &&
          existingPreset.name === presetObj.name
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
  presetId: string
): Promise<void> => {
  //presetと一致するものを削除
  try {
    const docRef = doc(db, "users", lineId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const existingPresets = docSnap.data().presets || [];
      const newPresets = existingPresets.filter(
        (existingPreset: { id: string }) => existingPreset.id !== presetId // IDでフィルタリング
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
): Promise<
  { name?: string; membersLineIds: string[]; presetId: string }[] | undefined
> => {
  try {
    const userDocRef = doc(db, "users", lineId); // usersドキュメントの参照を取得
    const userDocSnap = await getDoc(userDocRef); // ドキュメントのスナップショットを取得

    if (userDocSnap.exists()) {
      const presetObj = userDocSnap.data()?.presets; // データを取得し、presetsを取得

      // プリセットをオブジェクトの配列に変換
      const presets = presetObj.map(
        (preset: { membersLineIds: string[]; name?: string; id: string }) => ({
          name: preset.name,
          membersLineIds: preset.membersLineIds,
          presetId: preset.id,
        })
      );
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

