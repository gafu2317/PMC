// userService.ts
import { db } from "./firebase";
import {
  getDoc,
  updateDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { ServiceResponse, BanPeriod , StudioLocation } from "../types/type";
import { validatePassword, validateBanPeriod } from "../utils/validations";

// パスワードを変更する関数
export const changePassword = async (newPassword: string): Promise<ServiceResponse<void>> => {
  try {
    if (!validatePassword(newPassword)) {
      return { success: false, error: "Invalid password: must be a non-empty string" };
    }

    const docRef = doc(db, "setting", "password");
    await setDoc(docRef, { password: newPassword.trim() });

    console.log("Password successfully changed");
    return { success: true };

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to change password: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// パスワードを取得する関数
export const getPassword = async (): Promise<ServiceResponse<string>> => {
  try {
    const docRef = doc(db, "setting", "password");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: "Password not found" };
    }

    const password = docSnap.data()?.password;
    if (!password || typeof password !== 'string') {
      return { success: false, error: "Invalid password data" };
    }

    return { success: true, data: password };

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to get password: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// 予約禁止期間を設定する関数
export const addReservationBanPeriod = async (
  startDate: Date,
  endDate: Date,
  location: StudioLocation 
): Promise<ServiceResponse<void>> => {
  try {
    const validationError = validateBanPeriod(startDate, endDate);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const docRef = doc(db, "setting", "reservationBanPeriod");
    const docSnap = await getDoc(docRef);
    const existingPeriods = docSnap.exists() ? (docSnap.data()?.periods || []) : [];

    const newPeriod = {
      id: `ban_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`, 
      startDate, 
      endDate, 
      location
    };
    const updatedPeriods = [...existingPeriods, newPeriod];

    await setDoc(docRef, { periods: updatedPeriods });

    console.log("Reservation ban period successfully added");
    return { success: true };

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to add ban period: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// 予約禁止期間をすべて取得する関数
export const getReservationBanPeriods = async (): Promise<ServiceResponse<BanPeriod[]>> => {
  try {
    const docRef = doc(db, "setting", "reservationBanPeriod");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: true, data: [] };
    }

    const periodsData = docSnap.data()?.periods || [];
    const periods: BanPeriod[] = periodsData
      .map((period: any, index: number) => {
        try {
          return {
            id: period.id || `period_${index}`, // 既存データ対応
            startDate: period.startDate.toDate(),
            endDate: period.endDate.toDate(),
            location: (period.location as StudioLocation) || (period.isKinjyou ? 'kinjyou' : 'meiko') as StudioLocation, // 既存データ対応
          };
        } catch {
          return null;
        }
      })
      .filter((period: BanPeriod | null): period is BanPeriod => period !== null);

    return { success: true, data: periods };

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to get ban periods: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// 予約禁止期間を削除する関数
export const deleteReservationBanPeriod = async (id: string): Promise<ServiceResponse<void>> => {
  try {
    if (!id || typeof id !== 'string') {
      return { success: false, error: "Invalid ID" };
    }

    const docRef = doc(db, "setting", "reservationBanPeriod");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: "No ban periods found" };
    }

    const existingPeriods = docSnap.data()?.periods || [];
    const updatedPeriods = existingPeriods.filter((period: any) => period.id !== id);

    if (updatedPeriods.length === existingPeriods.length) {
      return { success: false, error: "Ban period not found" };
    }

    await updateDoc(docRef, { periods: updatedPeriods });
    return { success: true };

  } catch (error) {
    return { success: false, error: String(error) };
  }
};

// 優先権フラグを設定する関数
export const setPriorityFlag = async (priorityFlag: boolean): Promise<ServiceResponse<void>> => {
  try {
    const docRef = doc(db, "setting", "priorityFlag");
    await setDoc(docRef, { priorityFlag });

    console.log("Priority flag successfully set");
    return { success: true };

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to set priority flag: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// 優先権フラグを取得する関数
export const getPriorityFlag = async (): Promise<ServiceResponse<boolean>> => {
  try {
    const docRef = doc(db, "setting", "priorityFlag");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: true, data: false }; // デフォルトfalse
    }

    const priorityFlag = docSnap.data()?.priorityFlag;
    return { success: true, data: Boolean(priorityFlag) };

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to get priority flag: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// ２週間予約のフラグを設定する関数
export const setTwoWeeksFlag = async (twoWeeksFlag: boolean): Promise<ServiceResponse<void>> => {
  try {
    const docRef = doc(db, "setting", "twoWeeksFlag");
    await setDoc(docRef, { twoWeeksFlag });

    console.log("Two weeks flag successfully set");
    return { success: true };

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to set two weeks flag: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// ２週間予約のフラグを取得する関数
export const getTwoWeeksFlag = async (): Promise<ServiceResponse<boolean>> => {
  try {
    const docRef = doc(db, "setting", "twoWeeksFlag");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: true, data: false }; // デフォルトfalse
    }

    const twoWeeksFlag = docSnap.data()?.twoWeeksFlag;
    return { success: true, data: Boolean(twoWeeksFlag) };

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to get two weeks flag: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
// // 予約禁止期間を設定する関数
// export const setReservationBanPeriod = async (
//   startDate: Date,
//   endDate: Date,
//   isKinjyou: boolean
// ): Promise<void> => {
//   try {
//     const docRef = doc(db, "setting", "reservationBanPeriod");

//     // 現在の禁止期間を取得
//     const banPeriodDocSnap = await getDoc(docRef);
//     const existingBanPeriods = banPeriodDocSnap.data()?.periods || []; // 既存の禁止期間を配列として取得

//     // 新しい禁止期間を追加
//     existingBanPeriods.push({ startDate, endDate, isKinjyou });

//     // ドキュメントが存在しない場合は新規作成
//     if (!banPeriodDocSnap.exists()) {
//       await setDoc(docRef, { periods: existingBanPeriods });
//     } else {
//       // Firestore に更新
//       await updateDoc(docRef, {
//         periods: existingBanPeriods,
//       });
//     }
//     console.log("予約禁止期間が設定されました。");
//   } catch (error) {
//     console.error("予約禁止期間の設定に失敗しました:", error);
//   }
// };


// // 予約禁止期間を取得する関数
// export const getReservationBanPeriods = async (): Promise<
//   | {
//       startDate: Date;
//       endDate: Date;
//       isKinjyou: boolean;
//     }[]
//   | undefined
// > => {
//   try {
//     const banPeriodDocRef = doc(db, "setting", "reservationBanPeriod");
//     const banPeriodDocSnap = await getDoc(banPeriodDocRef);

//     // すべての禁止期間を取得
//     const banPeriodsData = banPeriodDocSnap.data()?.periods || [];
//     const banPeriods = banPeriodsData.map((period: any) => ({
//       startDate: period.startDate.toDate(),
//       endDate: period.endDate.toDate(),
//       isKinjyou: period.isKinjyou,
//     }));

//     return banPeriods; // 配列を返す
//   } catch (error) {
//     console.error("予約禁止期間の取得に失敗しました:", error);
//   }
// };


// // 予約禁止期間を削除する関数
// export const deleteReservationBanPeriod = async (
//   startDate: Date,
//   endDate: Date,
//   isKinjyou: boolean
// ): Promise<void> => {
//   try {
//     const docRef = doc(db, "setting", "reservationBanPeriod");
//     const banPeriodDocSnap = await getDoc(docRef);
//     const existingBanPeriods = banPeriodDocSnap.data()?.periods || []; // 既存の禁止期間を配列として取得

//     // 指定された禁止期間を削除
//     const updatedBanPeriods = existingBanPeriods.filter((period: any) => {
//       const periodStart = period.startDate.toDate(); // Firestore の Timestamp から Date に変換
//       const periodEnd = period.endDate.toDate(); // Firestore の Timestamp から Date に変換
//       return !(
//         periodStart.getTime() === startDate.getTime() &&
//         periodEnd.getTime() === endDate.getTime() &&
//         period.isKinjyou === isKinjyou
//       );
//     });

//     // Firestore に更新
//     await updateDoc(docRef, {
//       periods: updatedBanPeriods,
//     });
//     console.log("予約禁止期間が削除されました。");
//   } catch (error) {
//     console.error("予約禁止期間の削除に失敗しました:", error);
//   }
// };


// //優先権フラグを設定する関数
// export const setPriorityFlag = async (priorityFlag: boolean): Promise<void> => {
//   try {
//     const docRef = doc(db, "setting", "priorityFlag");
//     await updateDoc(docRef, { priorityFlag });
//     console.log("優先権フラグが設定されました。");
//   } catch (error) {
//     console.error("優先権フラグの設定に失敗しました:", error);
//   }
// };

// //優先権フラグを取得する関数
// export const getPriorityFlag = async (): Promise<boolean | undefined> => {
//   try {
//     const priorityFlagDocRef = doc(db, "setting", "priorityFlag");
//     const priorityFlagDocSnap = await getDoc(priorityFlagDocRef);
//     return priorityFlagDocSnap.data()?.priorityFlag;
//   } catch (error) {
//     console.error("優先権フラグの取得に失敗しました:", error);
//   }
// };

// //２週間予約のフラグを取得する関数
// export const getTwoWeeksFlag = async (): Promise<boolean | undefined> => {
//   try {
//     const twoWeeksFlagDocRef = doc(db, "setting", "twoWeeksFlag");
//     const twoWeeksFlagDocSnap = await getDoc(twoWeeksFlagDocRef);
//     return twoWeeksFlagDocSnap.data()?.twoWeeksFlag;
//   } catch (error) {
//     console.error("２週間予約のフラグの取得に失敗しました:", error);
//   }
// };

// //２週間予約のフラグを設定する関数
// export const setTwoWeeksFlag = async (twoWeeksFlag: boolean): Promise<void> => {
//   try {
//     const docRef = doc(db, "setting", "twoWeeksFlag");
//     await updateDoc(docRef, { twoWeeksFlag });
//     console.log("２週間予約のフラグが設定されました。");
//   } catch (error) {
//     console.error("２週間予約のフラグの設定に失敗しました:", error);
//   }
// };