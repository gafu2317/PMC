// // userService.ts
// import { db } from "./firebase";
// import { collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";

// // ユーザーを追加する関数
// const addUser = async (
//   name: string,
//   lineId: string,
//   reservations: Array<{ startTime: Date, EndTime: Date, fee: number }>
// ): Promise<void> => {
//   try {
//     const userDocRef = doc(db, "users", lineId);

//     // 新しいユーザーの情報を設定
//     await setDoc(userDocRef, {
//       name: name,
//       reservations: reservations,
//     });

//     console.log(`ユーザーが追加されました。`);
//   } catch (error) {
//     console.error("ユーザーの追加に失敗しました:", error);
//   }
// };

// //予約を追加する関数
// const addReservation = async (
//   lineId: string,
//   reservations: Array<{ startTime: Date, EndTime:Date, fee: number}>
// ): Promise<void> => {
//   try {
//     //usersコレクション内の特定のユーザーの参照を取得
//     const userCocRef = doc(db, "users", lineId);

//     //予約情報を追加
//     await setDoc(userCocRef, { reservations: reservations }, { merge: true });
//     console.log("予約が追加されました。");
//   } catch (error) {
//     console.error("予約の追加に失敗しました:", error);
//   }
// }

// export { addUser , addReservation };