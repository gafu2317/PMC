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
  studentId: string,
  furigana: string
): Promise<void> => {
  try {
    // usersドキュメントの参照を取得
    const docRef = doc(db, "users", lineId);
    // ユーザー情報を追加
    await setDoc(docRef, {
      name: name,
      furigana: furigana,
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
      furigana: doc.data().furigana || "データなし",
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

//予約を追加する関数
export const addReservations = async (
  reservatios: Reservation[]
): Promise<void> => {
  try {
    const batch = writeBatch(db); //バッチ処理を開始
    const docRef = collection(db, "reservations"); //reservationsコレクションの参照を取得
    for (const reservation of reservatios) {
      const newDocRef = doc(docRef); //新しいドキュメントの参照を取得
      batch.set(newDocRef, {
        names: reservation.names,
        date: Timestamp.fromDate(reservation.date),
      });
    }
    await batch.commit(); //バッチ処理を実行
    console.log("予約が追加されました。");
  } catch (error) {
    console.error("予約の追加に失敗しました:", error);
  }
};
//予約を追加する関数
export const addReservationsKinjyou = async (
  reservatios: Reservation[]
): Promise<void> => {
  try {
    const batch = writeBatch(db); //バッチ処理を開始
    const docRef = collection(db, "reservationsKinjyou"); //reservationsコレクションの参照を取得
    for (const reservation of reservatios) {
      const newDocRef = doc(docRef); //新しいドキュメントの参照を取得
      batch.set(newDocRef, {
        names: reservation.names,
        date: Timestamp.fromDate(reservation.date),
      });
    }
    await batch.commit(); //バッチ処理を実行
    console.log("予約が追加されました。");
  } catch (error) {
    console.error("予約の追加に失敗しました:", error);
  }
};

//管理者メニューで予約を追加する関数
export const addReservationsAdmin = async (
  reservatios: { names: string[]; date: Date }[]
): Promise<void> => {
  try {
    const batch = writeBatch(db); //バッチ処理を開始
    const docRef = collection(db, "reservations"); //reservationsコレクションの参照を取得
    for (const reservation of reservatios) {
      const newDocRef = doc(docRef); //新しいドキュメントの参照を取得
      batch.set(newDocRef, {
        names: reservation.names,
        date: Timestamp.fromDate(reservation.date),
      });
    }
    await batch.commit(); //バッチ処理を実行
    console.log("予約が追加されました。");
  } catch (error) {
    console.error("予約の追加に失敗しました:", error);
  }
};
//管理者メニューで予約を追加する関数
export const addReservationsAdminKinjyou = async (
  reservatios: { names: string[]; date: Date }[]
): Promise<void> => {
  try {
    const batch = writeBatch(db); //バッチ処理を開始
    const docRef = collection(db, "reservationsKinjyou"); //reservationsコレクションの参照を取得
    for (const reservation of reservatios) {
      const newDocRef = doc(docRef); //新しいドキュメントの参照を取得
      batch.set(newDocRef, {
        names: reservation.names,
        date: Timestamp.fromDate(reservation.date),
      });
    }
    await batch.commit(); //バッチ処理を実行
    console.log("予約が追加されました。");
  } catch (error) {
    console.error("予約の追加に失敗しました:", error);
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
// 予約を更新する関数
export const updateReservationKinjyou = async (
  id: string,
  names: string[]
): Promise<void> => {
  try {
    // reservationsのドキュメントの参照を取得
    const docRef = doc(db, "reservationsKinjyou", id);

    // ドキュメントを更新
    await setDoc(docRef, { names: names }, { merge: true });

    console.log("予約が更新されました。");
  } catch (error) {
    console.error("予約の更新に失敗しました:", error);
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
// 予約を削除する関数
export const deleteReservationKinjyou = async (id: string): Promise<void> => {
  try {
    // reservationsのドキュメントの参照を取得
    const docRef = doc(db, "reservationsKinjyou", id);

    // ドキュメントを削除
    await deleteDoc(docRef);

    console.log("予約が削除されました。");
  } catch (error) {
    console.error("予約の削除に失敗しました:", error);
  }
};

// 予約情報を取得する関数
export const getAllReservations = async (
  weekDays: {
    date: string; // "月/日" の形式
    day: number; // 日
    month: number; // 月
    year: number; // 年
  }[]
): Promise<Reservation[] | undefined> => {
  try {
    const reservationsColRef = collection(db, "reservations"); // reservationsコレクションの参照を取得
    const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

    const reservations = reservationsDocs.docs
      .filter((doc) => {
        // dateフィールドが存在し、有効なTimestampかチェック
        const dateField = doc.data().date;
        return dateField && typeof dateField.toDate === "function";
      })
      .map((doc) => ({
        id: doc.id,
        names: doc.data().names,
        date: doc.data().date.toDate(),
        dayIndex: getDayIndex(weekDays, doc.data().date.toDate()),
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
// 予約情報を取得する関数
export const getAllReservationsKinjyou = async (
  weekDays: {
    date: string; // "月/日" の形式
    day: number; // 日
    month: number; // 月
    year: number; // 年
  }[]
): Promise<Reservation[] | undefined> => {
  try {
    const reservationsColRef = collection(db, "reservationsKinjyou"); // reservationsコレクションの参照を取得
    const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

    const reservations = reservationsDocs.docs
      .filter((doc) => {
        // dateフィールドが存在し、有効なTimestampかチェック
        const dateField = doc.data().date;
        return dateField && typeof dateField.toDate === "function";
      })
      .map((doc) => ({
        id: doc.id,
        names: doc.data().names,
        date: doc.data().date.toDate(),
        dayIndex: getDayIndex(weekDays, doc.data().date.toDate()),
        timeIndex: getTimeIndexKinjyou(doc.data().date.toDate()),
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

//指定した期間の予約を取得する関数(dayIndexとtimeIndexなし)
export const getReservationsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<{ id: string; names: string[]; date: Date }[]> => {
  try {
    const reservationsColRef = collection(db, "reservations"); // reservationsコレクションの参照を取得
    const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

    const reservations = reservationsDocs.docs
      .filter((doc) => {
        // dateフィールドが存在し、有効なTimestampかチェック
        const dateField = doc.data().date;
        return dateField && typeof dateField.toDate === "function";
      })
      .map((doc) => ({
        id: doc.id,
        names: doc.data().names,
        date: doc.data().date.toDate(),
      }))
      .filter(
        (reservation) =>
          reservation.date >= startDate &&
          reservation.date <= endDate.setHours(23, 59, 59, 999) // 終了日の時間を23:59:59に設定
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return reservations;
  } catch (error) {
    return [];
  }
};
//指定した期間の予約を取得する関数(dayIndexとtimeIndexなし)
export const getReservationsByDateRangeKnjyou = async (
  startDate: Date,
  endDate: Date
): Promise<{ id: string; names: string[]; date: Date }[]> => {
  try {
    const reservationsColRef = collection(db, "reservationsKinjyou"); // reservationsコレクションの参照を取得
    const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

    const reservations = reservationsDocs.docs
      .filter((doc) => {
        // dateフィールドが存在し、有効なTimestampかチェック
        const dateField = doc.data().date;
        return dateField && typeof dateField.toDate === "function";
      })
      .map((doc) => ({
        id: doc.id,
        names: doc.data().names,
        date: doc.data().date.toDate(),
      }))
      .filter(
        (reservation) =>
          reservation.date >= startDate &&
          reservation.date <= endDate.setHours(23, 59, 59, 999) // 終了日の時間を23:59:59に設定
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return reservations;
  } catch (error) {
    return [];
  }
};

//全ての期間の予約を取得する関数(dayIndexとtimeIndexなし)
export const getAllPeriodReservations = async (): Promise<
  { id: string; names: string[]; date: Date }[]
> => {
  try {
    const reservationsColRef = collection(db, "reservations"); // reservationsコレクションの参照を取得
    const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

    const reservations = reservationsDocs.docs
      .filter((doc) => {
        // dateフィールドが存在し、有効なTimestampかチェック
        const dateField = doc.data().date;
        return dateField && typeof dateField.toDate === "function";
      })
      .map((doc) => ({
        id: doc.id,
        names: doc.data().names,
        date: doc.data().date.toDate(),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return reservations;
  } catch (error) {
    return [];
  }
};
//全ての期間の予約を取得する関数(dayIndexとtimeIndexなし)
export const getAllPeriodReservationsKinjyou = async (): Promise<
  { id: string; names: string[]; date: Date }[]
> => {
  try {
    const reservationsColRef = collection(db, "reservationsKinjyou"); // reservationsコレクションの参照を取得
    const reservationsDocs = await getDocs(reservationsColRef); // コレクション内の全てのドキュメントを取得

    const reservations = reservationsDocs.docs
      .filter((doc) => {
        // dateフィールドが存在し、有効なTimestampかチェック
        const dateField = doc.data().date;
        return dateField && typeof dateField.toDate === "function";
      })
      .map((doc) => ({
        id: doc.id,
        names: doc.data().names,
        date: doc.data().date.toDate(),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return reservations;
  } catch (error) {
    return [];
  }
};

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

// パスワードを変更する関数
export const changePassword = async (newPassword: string): Promise<void> => {
  try {
    const docRef = doc(db, "setting", "password");
    await setDoc(docRef, { password: newPassword });
    console.log("パスワードが変更されました。");
  } catch (error) {
    console.error("パスワードの変更に失敗しました:", error);
  }
};

// パスワードを取得する関数
export const getPassword = async (): Promise<string | undefined> => {
  try {
    const passwordDocRef = doc(db, "setting", "password");
    const passwordDocSnap = await getDoc(passwordDocRef);
    return passwordDocSnap.data()?.password;
  } catch (error) {
    console.error("パスワードの取得に失敗しました:", error);
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
    await setDoc(docRef, { unPaidFee: 0 }, { merge: true });
    console.log("未払い料金が削除されました。");
  } catch (error) {
    console.error("未払い料金の削除に失敗しました:", error);
  }
};


// 予約禁止期間を設定する関数
export const setReservationBanPeriod = async (
  startDate: Date,
  endDate: Date,
  isKinjyou: boolean
): Promise<void> => {
  try {
    const docRef = doc(db, "setting", "reservationBanPeriod");

    // 現在の禁止期間を取得
    const banPeriodDocSnap = await getDoc(docRef);
    const existingBanPeriods = banPeriodDocSnap.data()?.periods || []; // 既存の禁止期間を配列として取得

    // 新しい禁止期間を追加
    existingBanPeriods.push({ startDate, endDate, isKinjyou });

    // ドキュメントが存在しない場合は新規作成
    if (!banPeriodDocSnap.exists()) {
      await setDoc(docRef, { periods: existingBanPeriods });
    } else {
      // Firestore に更新
      await updateDoc(docRef, {
        periods: existingBanPeriods,
      });
    }
    console.log("予約禁止期間が設定されました。");
  } catch (error) {
    console.error("予約禁止期間の設定に失敗しました:", error);
  }
};

// 予約禁止期間を取得する関数
export const getReservationBanPeriod = async (): Promise<
  | {
      startDate: Date;
      endDate: Date;
      isKinjyou: boolean;
    }[]
  | undefined
> => {
  try {
    const banPeriodDocRef = doc(db, "setting", "reservationBanPeriod");
    const banPeriodDocSnap = await getDoc(banPeriodDocRef);

    // すべての禁止期間を取得
    const banPeriodsData = banPeriodDocSnap.data()?.periods || [];
    const banPeriods = banPeriodsData.map((period: any) => ({
      startDate: period.startDate.toDate(),
      endDate: period.endDate.toDate(),
      isKinjyou: period.isKinjyou,
    }));

    return banPeriods; // 配列を返す
  } catch (error) {
    console.error("予約禁止期間の取得に失敗しました:", error);
  }
};

// 予約禁止期間を削除する関数
export const deleteReservationBanPeriod = async (
  startDate: Date,
  endDate: Date,
  isKinjyou: boolean
): Promise<void> => {
  try {
    const docRef = doc(db, "setting", "reservationBanPeriod");
    const banPeriodDocSnap = await getDoc(docRef);
    const existingBanPeriods = banPeriodDocSnap.data()?.periods || []; // 既存の禁止期間を配列として取得

    // 指定された禁止期間を削除
    const updatedBanPeriods = existingBanPeriods.filter((period: any) => {
      const periodStart = period.startDate.toDate(); // Firestore の Timestamp から Date に変換
      const periodEnd = period.endDate.toDate(); // Firestore の Timestamp から Date に変換
      return !(
        periodStart.getTime() === startDate.getTime() &&
        periodEnd.getTime() === endDate.getTime() &&
        period.isKinjyou === isKinjyou
      );
    });

    // Firestore に更新
    await updateDoc(docRef, {
      periods: updatedBanPeriods,
    });
    console.log("予約禁止期間が削除されました。");
  } catch (error) {
    console.error("予約禁止期間の削除に失敗しました:", error);
  }
};

//優先権フラグを設定する関数
export const setPriorityFlag = async (priorityFlag: boolean): Promise<void> => {
  try {
    const docRef = doc(db, "setting", "priorityFlag");
    await updateDoc(docRef, { priorityFlag });
    console.log("優先権フラグが設定されました。");
  } catch (error) {
    console.error("優先権フラグの設定に失敗しました:", error);
  }
};

//優先権フラグを取得する関数
export const getPriorityFlag = async (): Promise<boolean | undefined> => {
  try {
    const priorityFlagDocRef = doc(db, "setting", "priorityFlag");
    const priorityFlagDocSnap = await getDoc(priorityFlagDocRef);
    return priorityFlagDocSnap.data()?.priorityFlag;
  } catch (error) {
    console.error("優先権フラグの取得に失敗しました:", error);
  }
};

//２週間予約のフラグを設定する関数
export const setTwoWeeksFlag = async (twoWeeksFlag: boolean): Promise<void> => {
  try {
    const docRef = doc(db, "setting", "twoWeekBookingFlag");
    await updateDoc(docRef, { twoWeeksFlag });
    console.log("２週間予約のフラグが設定されました。");
  } catch (error) {
    console.error("２週間予約のフラグの設定に失敗しました:", error);
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
