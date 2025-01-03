import React, { useState, useEffect } from "react";
import ReservationPopup from "./components/ReservationPopup";
import EditReservationPopup from "./components/EditReservationPopup";
import ReservationDisplay from "./components/ReservationDisplay";
import { Reservation } from "./types/type";
import { getAllReservations } from "./firebase/userService";
import { db } from "./firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { daysOfWeek, timeSlots } from "./utils/utils";
import Calendar from "./components/Calendar";

function App() {
  // 予約情報を管理
  const [reservations, setReservations] = useState<Reservation[]>([]);
  // Firestoreから予約情報を取得
  useEffect(() => {
    const collectionRef = collection(db, "reservations");
    // リアルタイムリスナーを設定
    const unsubscribe = onSnapshot(collectionRef, async () => {
      try {
        const newReservations = await getAllReservations();
        if (newReservations) {
          setReservations(newReservations); // 状態を更新
        } else {
          console.warn("予約情報が取得できませんでした。");
        }
      } catch (error) {
        console.error("予約情報の取得に失敗しました:", error);
      }
    });
    // クリーンアップ関数を返すことで、コンポーネントがアンマウントされるときにリスナーを解除
    return () => unsubscribe();
  }, []); // マウント時にのみ実行

  //　選択している時間帯を管理(Hourに渡しやすい二次元配列)
  const [selectedHours, setSelectedHours] = useState<boolean[][]>(
    Array.from({ length: daysOfWeek.length }, () => Array(timeSlots.length))
  );
  // Hourをクリックしたときのハンドラ
  const handleHourClick = (dayIndex: number, timeIndex: number) => {
    const newSelectedHours = [...selectedHours];
    newSelectedHours[dayIndex][timeIndex] =
      !newSelectedHours[dayIndex][timeIndex];
    setSelectedHours(newSelectedHours);
  };

  // 選択している予約を管理(EditReservationPopupに渡しやすい型)
  const [selectedReservations, setSelectedReservations] = useState<
    string[][][]
  >(
    Array.from({ length: daysOfWeek.length }, () =>
      Array.from({ length: timeSlots.length }, () => [])
    )
  );
  //予約をクリックした時のハンドラ
  const handleReservationClic = (
    dayIndex: number,
    timeIndex: number,
    id: string
  ) => {
    setSelectedReservations((prev) => {
      const newSelectedReservations = [...prev];
      const index = newSelectedReservations[dayIndex][timeIndex].indexOf(id);
      if (index > -1) {
        newSelectedReservations[dayIndex][timeIndex].splice(index, 1);
      } else {
        newSelectedReservations[dayIndex][timeIndex].push(id);
      }
      return newSelectedReservations;
    });
  };

  // // 予約者名を管理
  // const [reservedNames, setReservedNames] = useState<string[][][][]>(
  //   Array.from({ length: timeSlots.length }, () =>
  //     Array.from({ length: daysOfWeek.length }, () => [])
  //   )
  // );

  // // 予約ポップアップの表示状態を管理
  // const [isReservationPopupVisible, setIsReservationPopupVisible] =
  //   useState(false);

  // // 編集ポップアップの表示状態を管理
  // const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);

  // // 予約ボタンをクリックしたときのハンドラ
  // const handleReserve = () => {
  //   setIsReservationPopupVisible(true);
  // };

  // // 名前を追加するするハンドラー
  // const handleNameSubmit = (names: string[]) => {
  //   const newReservedNames = [...reservedNames];
  //   const newSelectedHours = [...selectedHours];

  //   for (let i = 0; i < timeSlots.length; i++) {
  //     for (let j = 0; j < daysOfWeek.length; j++) {
  //       if (newSelectedHours[i][j]) {
  //         newReservedNames[i][j].push(names);
  //       }
  //     }
  //   }

  //   setReservedNames(newReservedNames);
  // };

  // // 名前を追加するハンドラー
  // const handleNameAdd = (
  //   dayIndex: number,
  //   timeIndex: number,
  //   teamIndex: number,
  //   namesToAdd: string[]
  // ) => {
  //   const newReservedNames = [...reservedNames];
  //   namesToAdd.forEach((name) => {
  //     newReservedNames[timeIndex][dayIndex][teamIndex].push(name);
  //   });
  //   setReservedNames(newReservedNames);
  // };

  // // 名前を削除するハンドラー
  // const handleNameRemove = (
  //   dayIndex: number,
  //   timeIndex: number,
  //   teamIndex: number,
  //   namesToRemove: string[]
  // ) => {
  //   const namesSet = new Set(namesToRemove);

  //   // 新しい配列を作成
  //   const newReservedNames = [...reservedNames];

  //   // currentTeamをフィルタリングして新しい配列を作成
  //   newReservedNames[timeIndex][dayIndex][teamIndex] = newReservedNames[
  //     timeIndex
  //   ][dayIndex][teamIndex].filter((name) => !namesSet.has(name));
  //   console.log("newReservedNames", newReservedNames);
  //   // 状態を更新
  //   setReservedNames(newReservedNames);
  // };

  // // 予約を削除するハンドラ
  // const handleReservationRemove = (
  //   dayIndex: number,
  //   timeIndex: number,
  //   teamIndex: number
  // ) => {
  //   // 選択された予約をクリア
  //   setSelectedReservations([]);
  //   const newReservedNames = [...reservedNames];

  //   // 指定されたインデックスの要素を削除する
  //   newReservedNames[timeIndex][dayIndex].splice(teamIndex, 1);

  //   // 状態を更新
  //   setReservedNames(newReservedNames);
  // };

  // // 編集ボタンをクリックしたときのハンドラ
  // const handleEditPopup = () => {
  //   if (selectedReservations.length > 0) {
  //     setIsEditPopupVisible(true);
  //   }
  // };

  return (
    <div className="p-5">
      <Calendar
        reservations={reservations}
        selectedHours={selectedHours}
        onHourClick={handleHourClick}
      />
      <ReservationDisplay
        reservations={reservations}
        selectedHours={selectedHours}
        selectedReservations={selectedReservations}
        onReservationClick={handleReservationClic}
      />

      {/* <button
        className="fixed bottom-24 right-8 p-2 bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center"
        onClick={handleReserve}
      >
        予約
      </button> */}

      {/* <button
        className="fixed bottom-8 right-8 p-2 bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center"
        onClick={handleEditPopup}
      >
        編集
      </button> */}

      {/* {isReservationPopupVisible && (
        <ReservationPopup
          onSubmit={handleNameSubmit}
          onClose={() => setIsReservationPopupVisible(false)}
        />
      )} */}

      {/* {isEditPopupVisible && (
        <EditReservationPopup
          daysOfWeek={daysOfWeek}
          timeSlots={timeSlots}
          reservedNames={reservedNames}
          selectedReservations={selectedReservations} // 選択された予約情報を渡す
          onClose={() => setIsEditPopupVisible(false)}
          onNameAdd={handleNameAdd}
          onNameRemove={handleNameRemove}
          onDelete={handleReservationRemove}
        />
      )} */}
    </div>
  );
}

export default App;
