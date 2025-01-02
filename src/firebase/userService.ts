// userService.ts
import { db } from "./firebase";
import { collection, addDoc, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { getDayIndex, getTimeIndex } from "../utils/utils";
import { Reservation } from "../types/type";


// // ユーザーを追加する関数
// export const addUser = async (
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

//予約を追加する関数
export const addReservation = async (
  reservation: Reservation
): Promise<void> => {
  try {
    //usersコレクションの参照を取得
    const docRef = doc(db, "reservations", reservation.id);

    //予約情報を追加
    await setDoc(docRef, {
      names: reservation.names,
      date: reservation.date,
    });
    console.log("予約が追加されました。");
  } catch (error) {
    console.error("予約の追加に失敗しました:", error);
  }
}

// 予約を削除する関数
export const deleteReservation = async (id: string): Promise<void> => {
  try {
    // ユーザーのドキュメントの参照を取得
    const docRef = doc(db, "reservations", id);

    // ドキュメントを削除
    await deleteDoc(docRef);

    console.log("予約が削除されました。");
  } catch (error) {
    console.error("予約の削除に失敗しました:", error);
  }
}

// // ユーザーの情報を取得する関数
// export const getUser = async (lineId: string) => {
//   try {
//     const userDocRef = doc(db, "users", lineId);
//     const userDoc = await getDocs(collection(db, "users"));
//     console.log(userDoc);
//   } catch (error) {
//     console.error("ユーザーの取得に失敗しました:", error);
//   }
// }

// 予約情報を取得する関数
export const getAllReservations = async (): Promise<Reservation[] | undefined> => {
  try {
    const userCollectionRef = collection(db, "users"); // usersコレクションの参照を取得
    const userDocs = await getDocs(userCollectionRef); // コレクション内の全てのドキュメントを取得

    const isReserved = Array.from({ length: 8 }, () =>
      Array.from({ length: 12 }, () => 0)
    );

    const reservations = userDocs.docs.map((doc) => ({
      id: doc.id,
      names: doc.data().names,
      date: doc.data().date.toDate(),
      dayIndex: getDayIndex(doc.data().date),
      timeIndex: getTimeIndex(doc.data().date),
      teamIndex: isReserved[getDayIndex(doc.data().date)][
        getTimeIndex(doc.data().date)
      ]++, // 格納した後にインクリメント
    }));

    return reservations;
  } catch (error) {
    console.error("予約の取得に失敗しました:", error);
  }
};
