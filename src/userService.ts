// src/userService.ts
import { db } from "./firebase";
import { UserData } from "./types"; // UserDataインターフェースをインポート
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// ユーザーを追加する関数
export const addUser = async (user: UserData) => {
  const docRef = await addDoc(collection(db, "users"), user);
  return docRef.id;
};

// ユーザーを取得する関数
export const getUsers = async (): Promise<UserData[]> => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as UserData[];
};

// ユーザーを更新する関数
export const updateUser = async (
  id: string,
  updatedData: Partial<UserData>
) => {
  const userRef = doc(db, "users", id);
  await updateDoc(userRef, updatedData);
};

// ユーザーを削除する関数
export const deleteUser = async (id: string) => {
  await deleteDoc(doc(db, "users", id));
};
