// userService.ts
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { getDayIndex, getTimeIndex, getTimeIndexKinjyou } from "../utils/utils";
import {  Reservation, CreateReservationRequest,ServiceResponse, StudioLocation } from "../types/type";
import { validateCreateReservationRequest, validateNames, validateLocation } from "../utils/validations";

const getCollectionName = (location: StudioLocation): string => {
  return location === 'kinjyou' ? 'reservationsKinjyou' : 'reservations';
};

const getTimeIndexByLocation = (date: Date, location: StudioLocation): number => {
  return location === 'kinjyou' ? getTimeIndexKinjyou(date) : getTimeIndex(date);
};


// 予約を追加する関数
export const addReservations = async (
  reservations: CreateReservationRequest[]
): Promise<ServiceResponse<void>> => {
  try {
    // バリデーション
    if (!Array.isArray(reservations) || reservations.length === 0) {
      return { success: false, error: "Invalid reservations: must be a non-empty array" };
    }

    for (const reservation of reservations) {
      const validationError = validateCreateReservationRequest(reservation);
      if (validationError) {
        return { success: false, error: validationError };
      }
    }

    // locationごとにグループ化
    const groupedReservations = reservations.reduce((acc, reservation) => {
      if (!acc[reservation.location]) {
        acc[reservation.location] = [];
      }
      acc[reservation.location].push(reservation);
      return acc;
    }, {} as Record<StudioLocation, CreateReservationRequest[]>);

    // 各locationごとにバッチ処理
    for (const [location, locationReservations] of Object.entries(groupedReservations)) {
      const batch = writeBatch(db);
      const collectionRef = collection(db, getCollectionName(location as StudioLocation));

      for (const reservation of locationReservations) {
        const newDocRef = doc(collectionRef);
        batch.set(newDocRef, {
          names: reservation.names,
          date: Timestamp.fromDate(reservation.date)
        });
      }

      await batch.commit();
    }

    console.log(`Successfully added ${reservations.length} reservations`);
    return { success: true };

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to add reservations: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};


export const updateReservation = async (
  id: string,
  names: string[],
  location: StudioLocation
): Promise<ServiceResponse<void>> => {
  try {
    // バリデーション
    if (!id || typeof id !== 'string') {
      return { success: false, error: "Invalid reservation ID" };
    }
    if (!validateNames(names)) {
      return { success: false, error: "Invalid names: must be a non-empty array of valid names" };
    }
    if (!validateLocation(location)) {
      return { success: false, error: "Invalid location: must be 'meiko' or 'kinjyou'" };
    }

    const docRef = doc(db, getCollectionName(location), id);
    await setDoc(docRef, { names }, { merge: true });

    console.log(`Reservation successfully updated: ${id}`);
    return { success: true };

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to update reservation: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

export const deleteReservation = async (
  id: string,
  location: StudioLocation
): Promise<ServiceResponse<void>> => {
  try {
    // バリデーション
    if (!id || typeof id !== 'string') {
      return { success: false, error: "Invalid reservation ID" };
    }
    if (!validateLocation(location)) {
      return { success: false, error: "Invalid location: must be 'meiko' or 'kinjyou'" };
    }

    const docRef = doc(db, getCollectionName(location), id);
    await deleteDoc(docRef);

    console.log(`Reservation successfully deleted: ${id}`);
    return { success: true };

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to delete reservation: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

export const getAllReservations = async (
  weekDays: WeekDayInfo[],
  location: StudioLocation
): Promise<ServiceResponse<Reservation[]>> => {
  try {
    // バリデーション
    if (!Array.isArray(weekDays)) {
      return { success: false, error: "Invalid weekDays: must be an array" };
    }
    if (!validateLocation(location)) {
      return { success: false, error: "Invalid location: must be 'meiko' or 'kinjyou'" };
    }

    const collectionRef = collection(db, getCollectionName(location));
    const reservationsDocs = await getDocs(collectionRef);

    const reservations: Reservation[] = reservationsDocs.docs
      .filter((doc) => {
        const dateField = doc.data().date;
        return dateField && typeof dateField.toDate === "function";
      })
      .map((doc) => {
        const data = doc.data();
        const date = data.date.toDate();
        return {
          id: doc.id,
          names: data.names || [],
          date,
          location,
          dayIndex: getDayIndex(weekDays, date),
          timeIndex: getTimeIndexByLocation(date, location)
        };
      })
      .filter(reservation => 
        reservation.dayIndex !== -1 && reservation.timeIndex !== -1
      );

    return { success: true, data: reservations };

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to get reservations: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// //予約を追加する関数
// export const addReservations = async (
//   reservatios: Reservation[]
// ): Promise<void> => {
//   try {
//     const batch = writeBatch(db); //バッチ処理を開始
//     const docRef = collection(db, "reservations"); //reservationsコレクションの参照を取得
//     for (const reservation of reservatios) {
//       const newDocRef = doc(docRef); //新しいドキュメントの参照を取得
//       batch.set(newDocRef, {
//         names: reservation.names,
//         date: Timestamp.fromDate(reservation.date),
//       });
//     }
//     await batch.commit(); //バッチ処理を実行
//     console.log("予約が追加されました。");
//   } catch (error) {
//     console.error("予約の追加に失敗しました:", error);
//   }
// };
// //予約を追加する関数
// export const addReservationsKinjyou = async (
//   reservatios: Reservation[]
// ): Promise<void> => {
//   try {
//     const batch = writeBatch(db); //バッチ処理を開始
//     const docRef = collection(db, "reservationsKinjyou"); //reservationsコレクションの参照を取得
//     for (const reservation of reservatios) {
//       const newDocRef = doc(docRef); //新しいドキュメントの参照を取得
//       batch.set(newDocRef, {
//         names: reservation.names,
//         date: Timestamp.fromDate(reservation.date),
//       });
//     }
//     await batch.commit(); //バッチ処理を実行
//     console.log("予約が追加されました。");
//   } catch (error) {
//     console.error("予約の追加に失敗しました:", error);
//   }
// };

// //管理者メニューで予約を追加する関数
// export const addReservationsAdmin = async (
//   reservatios: { names: string[]; date: Date }[]
// ): Promise<void> => {
//   try {
//     const batch = writeBatch(db); //バッチ処理を開始
//     const docRef = collection(db, "reservations"); //reservationsコレクションの参照を取得
//     for (const reservation of reservatios) {
//       const newDocRef = doc(docRef); //新しいドキュメントの参照を取得
//       batch.set(newDocRef, {
//         names: reservation.names,
//         date: Timestamp.fromDate(reservation.date),
//       });
//     }
//     await batch.commit(); //バッチ処理を実行
//     console.log("予約が追加されました。");
//   } catch (error) {
//     console.error("予約の追加に失敗しました:", error);
//   }
// };
// //管理者メニューで予約を追加する関数
// export const addReservationsAdminKinjyou = async (
//   reservatios: { names: string[]; date: Date }[]
// ): Promise<void> => {
//   try {
//     const batch = writeBatch(db); //バッチ処理を開始
//     const docRef = collection(db, "reservationsKinjyou"); //reservationsコレクションの参照を取得
//     for (const reservation of reservatios) {
//       const newDocRef = doc(docRef); //新しいドキュメントの参照を取得
//       batch.set(newDocRef, {
//         names: reservation.names,
//         date: Timestamp.fromDate(reservation.date),
//       });
//     }
//     await batch.commit(); //バッチ処理を実行
//     console.log("予約が追加されました。");
//   } catch (error) {
//     console.error("予約の追加に失敗しました:", error);
//   }
// };

// // 予約を更新する関数
// export const updateReservation = async (
//   id: string,
//   names: string[]
// ): Promise<void> => {
//   try {
//     // reservationsのドキュメントの参照を取得
//     const docRef = doc(db, "reservations", id);

//     // ドキュメントを更新
//     await setDoc(docRef, { names: names }, { merge: true });

//     console.log("予約が更新されました。");
//   } catch (error) {
//     console.error("予約の更新に失敗しました:", error);
//   }
// };
// // 予約を更新する関数
// export const updateReservationKinjyou = async (
//   id: string,
//   names: string[]
// ): Promise<void> => {
//   try {
//     // reservationsのドキュメントの参照を取得
//     const docRef = doc(db, "reservationsKinjyou", id);

//     // ドキュメントを更新
//     await setDoc(docRef, { names: names }, { merge: true });

//     console.log("予約が更新されました。");
//   } catch (error) {
//     console.error("予約の更新に失敗しました:", error);
//   }
// };

// // 予約を削除する関数
// export const deleteReservation = async (id: string): Promise<void> => {
//   try {
//     // reservationsのドキュメントの参照を取得
//     const docRef = doc(db, "reservations", id);

//     // ドキュメントを削除
//     await deleteDoc(docRef);

//     console.log("予約が削除されました。");
//   } catch (error) {
//     console.error("予約の削除に失敗しました:", error);
//   }
// };
// // 予約を削除する関数
// export const deleteReservationKinjyou = async (id: string): Promise<void> => {
//   try {
//     // reservationsのドキュメントの参照を取得
//     const docRef = doc(db, "reservationsKinjyou", id);

//     // ドキュメントを削除
//     await deleteDoc(docRef);

//     console.log("予約が削除されました。");
//   } catch (error) {
//     console.error("予約の削除に失敗しました:", error);
//   }
// };

// // 予約情報を取得する関数
// export const getAllReservations = async (
//   weekDays: {
//     date: string; // "月/日" の形式
//     day: number; // 日
//     month: number; // 月
//     year: number; // 年
//   }[]
// ): Promise<Reservation[] | undefined> => {
//   try {
//     const reservationsColRef = collection(db, "reservations"); // reservationsコレクションの参照を取得
//     const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

//     const reservations = reservationsDocs.docs
//       .filter((doc) => {
//         // dateフィールドが存在し、有効なTimestampかチェック
//         const dateField = doc.data().date;
//         return dateField && typeof dateField.toDate === "function";
//       })
//       .map((doc) => ({
//         id: doc.id,
//         names: doc.data().names,
//         date: doc.data().date.toDate(),
//         dayIndex: getDayIndex(weekDays, doc.data().date.toDate()),
//         timeIndex: getTimeIndex(doc.data().date.toDate()),
//       }))
//       .filter(
//         (reservation) =>
//           reservation.dayIndex !== -1 && reservation.timeIndex !== -1
//       );

//     return reservations;
//   } catch (error) {
//     console.error("予約の取得に失敗しました:", error);
//   }
// };
// // 予約情報を取得する関数
// export const getAllReservationsKinjyou = async (
//   weekDays: {
//     date: string; // "月/日" の形式
//     day: number; // 日
//     month: number; // 月
//     year: number; // 年
//   }[]
// ): Promise<Reservation[] | undefined> => {
//   try {
//     const reservationsColRef = collection(db, "reservationsKinjyou"); // reservationsコレクションの参照を取得
//     const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

//     const reservations = reservationsDocs.docs
//       .filter((doc) => {
//         // dateフィールドが存在し、有効なTimestampかチェック
//         const dateField = doc.data().date;
//         return dateField && typeof dateField.toDate === "function";
//       })
//       .map((doc) => ({
//         id: doc.id,
//         names: doc.data().names,
//         date: doc.data().date.toDate(),
//         dayIndex: getDayIndex(weekDays, doc.data().date.toDate()),
//         timeIndex: getTimeIndexKinjyou(doc.data().date.toDate()),
//       }))
//       .filter(
//         (reservation) =>
//           reservation.dayIndex !== -1 && reservation.timeIndex !== -1
//       );

//     return reservations;
//   } catch (error) {
//     console.error("予約の取得に失敗しました:", error);
//   }
// };

// //指定した期間の予約を取得する関数(dayIndexとtimeIndexなし)
// export const getReservationsByDateRange = async (
//   startDate: Date,
//   endDate: Date
// ): Promise<{ id: string; names: string[]; date: Date }[]> => {
//   try {
//     const reservationsColRef = collection(db, "reservations"); // reservationsコレクションの参照を取得
//     const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

//     const reservations = reservationsDocs.docs
//       .filter((doc) => {
//         // dateフィールドが存在し、有効なTimestampかチェック
//         const dateField = doc.data().date;
//         return dateField && typeof dateField.toDate === "function";
//       })
//       .map((doc) => ({
//         id: doc.id,
//         names: doc.data().names,
//         date: doc.data().date.toDate(),
//       }))
//       .filter(
//         (reservation) =>
//           reservation.date >= startDate &&
//           reservation.date <= endDate.setHours(23, 59, 59, 999) // 終了日の時間を23:59:59に設定
//       )
//       .sort((a, b) => a.date.getTime() - b.date.getTime());

//     return reservations;
//   } catch (error) {
//     return [];
//   }
// };
// //指定した期間の予約を取得する関数(dayIndexとtimeIndexなし)
// export const getReservationsByDateRangeKnjyou = async (
//   startDate: Date,
//   endDate: Date
// ): Promise<{ id: string; names: string[]; date: Date }[]> => {
//   try {
//     const reservationsColRef = collection(db, "reservationsKinjyou"); // reservationsコレクションの参照を取得
//     const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

//     const reservations = reservationsDocs.docs
//       .filter((doc) => {
//         // dateフィールドが存在し、有効なTimestampかチェック
//         const dateField = doc.data().date;
//         return dateField && typeof dateField.toDate === "function";
//       })
//       .map((doc) => ({
//         id: doc.id,
//         names: doc.data().names,
//         date: doc.data().date.toDate(),
//       }))
//       .filter(
//         (reservation) =>
//           reservation.date >= startDate &&
//           reservation.date <= endDate.setHours(23, 59, 59, 999) // 終了日の時間を23:59:59に設定
//       )
//       .sort((a, b) => a.date.getTime() - b.date.getTime());

//     return reservations;
//   } catch (error) {
//     return [];
//   }
// };

// //全ての期間の予約を取得する関数(dayIndexとtimeIndexなし)
// export const getAllPeriodReservations = async (): Promise<
//   { id: string; names: string[]; date: Date }[]
// > => {
//   try {
//     const reservationsColRef = collection(db, "reservations"); // reservationsコレクションの参照を取得
//     const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

//     const reservations = reservationsDocs.docs
//       .filter((doc) => {
//         // dateフィールドが存在し、有効なTimestampかチェック
//         const dateField = doc.data().date;
//         return dateField && typeof dateField.toDate === "function";
//       })
//       .map((doc) => ({
//         id: doc.id,
//         names: doc.data().names,
//         date: doc.data().date.toDate(),
//       }))
//       .sort((a, b) => a.date.getTime() - b.date.getTime());

//     return reservations;
//   } catch (error) {
//     return [];
//   }
// };
// //全ての期間の予約を取得する関数(dayIndexとtimeIndexなし)
// export const getAllPeriodReservationsKinjyou = async (): Promise<
//   { id: string; names: string[]; date: Date }[]
// > => {
//   try {
//     const reservationsColRef = collection(db, "reservationsKinjyou"); // reservationsコレクションの参照を取得
//     const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

//     const reservations = reservationsDocs.docs
//       .filter((doc) => {
//         // dateフィールドが存在し、有効なTimestampかチェック
//         const dateField = doc.data().date;
//         return dateField && typeof dateField.toDate === "function";
//       })
//       .map((doc) => ({
//         id: doc.id,
//         names: doc.data().names,
//         date: doc.data().date.toDate(),
//       }))
//       .sort((a, b) => a.date.getTime() - b.date.getTime());

//     return reservations;
//   } catch (error) {
//     return [];
//   }
// };