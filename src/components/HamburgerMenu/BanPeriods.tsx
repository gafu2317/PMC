import { useState, useEffect } from "react";
import {
  setReservationBanPeriod,
  parseReservationBanPeriodsFromDocData,
  mapMeikouDocsToBanOverlapRows,
  mapKinjyouDocsToBanOverlapRows,
  deleteReservationBanPeriod,
  deleteReservation,
} from "../../firebase/userService";
import { db } from "../../firebase/firebase";
import { collection, onSnapshot, doc } from "firebase/firestore";
import Swal from "sweetalert2";

const BanPeriods: React.FC = () => {
  const [newStartDate, setNewStartDate] = useState<Date | null>(null);
  const [newEndDate, setNewEndDate] = useState<Date | null>(null);
  const [newIsKinjyou, setNewIsKinjyou] = useState<boolean | null>(null);
  const [banPeriods, setBanPeriods] = useState<
    { startDate: Date; endDate: Date; isKinjyou: boolean }[]
  >([]);
  const [reservations, setReservations] = useState<
    { id: string; names: string[]; startDate: Date; endDate: Date }[]
  >([]);
  const [reservationsKinjyou, setReservationsKinjyou] = useState<
    { id: string; names: string[]; startDate: Date; endDate: Date }[]
  >([]);
  useEffect(() => {
    const collectionRef = collection(db, "reservations");
    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        setReservations(mapMeikouDocsToBanOverlapRows(snapshot.docs));
      },
      (error) => {
        console.error("予約情報の取得に失敗しました:", error);
      }
    );
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const collectionRef = collection(db, "reservationsKinjyou");
    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        setReservationsKinjyou(mapKinjyouDocsToBanOverlapRows(snapshot.docs));
      },
      (error) => {
        console.error("予約情報の取得に失敗しました:", error);
      }
    );
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const banDocRef = doc(db, "setting", "reservationBanPeriod");
    const unsubscribe = onSnapshot(
      banDocRef,
      (snap) => {
        setBanPeriods(parseReservationBanPeriodsFromDocData(snap.data()));
      },
      (error) => {
        console.error("予約禁止期間の取得に失敗しました:", error);
      }
    );
    return () => unsubscribe();
  }, []);
  // 日付を "yyyy-MM-ddTHH:mm" 形式に変換するヘルパー関数
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 月は0から始まるため +1
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`; // フォーマットを整形
  };
  const handleSet = async () => {
    if (!newStartDate || !newEndDate || newIsKinjyou === null) {
      Swal.fire("エラー", "日時を入力してください。", "error");
      return;
    }
    if (newStartDate >= newEndDate) {
      Swal.fire("エラー", "終了日時は開始日時より後にしてください。", "error");
      return;
    }

    // 使用する予約リストを選択
    const overlappingReservations = newIsKinjyou
      ? reservationsKinjyou.filter(
          (reservation) =>
            reservation.startDate < newEndDate &&
            reservation.endDate > newStartDate
        )
      : reservations.filter(
          (reservation) =>
            reservation.startDate < newEndDate &&
            reservation.endDate > newStartDate
        );

    if (overlappingReservations.length > 0) {
      // 予約がある場合、確認ダイアログを表示
      const result = await Swal.fire({
        title: "確認",
        text: "この期間に予約があります。予約を削除しますか？",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "はい",
        cancelButtonText: "いいえ",
      });

      if (result.isConfirmed) {
        // 確認された場合、予約を削除する
        for (const reservation of overlappingReservations) {
          await deleteReservation(reservation.id); // 予約を削除
        }
      } else {
        // 削除しない場合、処理を中止
        return;
      }
    }

    await setReservationBanPeriod(newStartDate, newEndDate, newIsKinjyou);
    setNewStartDate(null);
    setNewEndDate(null);
    setNewIsKinjyou(null);
  };
  const handleDelete = async (
    startDate: Date,
    endDate: Date,
    isKinjyou: boolean
  ) => {
    await deleteReservationBanPeriod(startDate, endDate, isKinjyou);
  };
  return (
    <div>
      <div className="flex justify-center items-center">
        <h2 className="mb-2 text-lg">予約禁止期間</h2>
      </div>
      <ul className="mb-2">
        {banPeriods.length === 0 ? (
          <li className="text-center">なし</li>
        ) : (
          banPeriods.map((period, index) => (
            <li key={index} className="flex justify-between items-center mb-2">
              <div>
                <div className="font-bold">
                  {period.isKinjyou ? "金城" : "名工"}
                </div>
                <div>
                  {period.startDate.toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false, // 24時間形式
                  })}
                </div>
                <div>
                  〜{" "}
                  {period.endDate.toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false, // 24時間形式
                  })}
                </div>
              </div>
              <button
                className="text-red-500 border border-red-500 rounded p-1"
                onClick={() =>
                  handleDelete(
                    period.startDate,
                    period.endDate,
                    period.isKinjyou
                  )
                }
              >
                削除
              </button>
            </li>
          ))
        )}
      </ul>

      <h2 className="flex justify-center items-center my-2 text-lg">
        予約禁止期間を設定
      </h2>
      <div className="mb-2">
        <div className="mb-2">
          <label className="block">開始日時:</label>
          <input
            className="border rounded p-1 w-full"
            type="datetime-local"
            value={formatDateForInput(newStartDate)}
            onChange={(e) => setNewStartDate(new Date(e.target.value))}
          />
        </div>
        <div className="mb-2">
          <label className="block">終了日時:</label>
          <input
            className="border rounded p-1 w-full"
            type="datetime-local"
            value={formatDateForInput(newEndDate)}
            onChange={(e) => setNewEndDate(new Date(e.target.value))}
          />
        </div>
        <div className="mb-2 flex justify-around">
          <div>
            <label>名工学スタ:</label>
            <input
              className="border rounded p-1 ml-2"
              type="checkbox"
              checked={newIsKinjyou === null ? false : !newIsKinjyou} // nullの場合はチェックなし
              onChange={(e) => setNewIsKinjyou(newIsKinjyou===null ? !e.target.checked : null)} // nullの場合はnullにする
            />
          </div>
          <div>
            <label>金城学スタ:</label>
            <input
              className="border rounded p-1 ml-2"
              type="checkbox"
              checked={newIsKinjyou === null ? false : newIsKinjyou} // nullの場合はチェックなし
              onChange={(e) => setNewIsKinjyou(newIsKinjyou===null ? e.target.checked : null)} // nullの場合はnullにする
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          className="bg-blue-500 text-white rounded p-1"
          onClick={handleSet}
        >
          設定
        </button>
      </div>
    </div>
  );
};

export default BanPeriods;
