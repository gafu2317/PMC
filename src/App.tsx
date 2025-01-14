import { useState, useEffect } from "react";
import ReservationPopup from "./components/ReservationPopup";
import EditReservationPopup from "./components/EditReservationPopup";
import ReservationDisplay from "./components/ReservationDisplay";
import { Reservation, Member, Band } from "./types/type";
import { getAllReservations, getAllUser } from "./firebase/userService";
import { db } from "./firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { daysOfWeek, timeSlots } from "./utils/utils";
import Calendar from "./components/Calendar";
import RegistrationPopup from "./components/RegistrationPopup";
import { initLiff } from "./liff/liffService";
import HamburgerMenu from "./components/HamburgerMenu";
import Header from "./components/Header";
import Swal from "sweetalert2";
import BandPopup from "./components/BandPopup";
import { getAllBands } from "./firebase/userService";

function App() {
  //部員を管理
  const [members, setMembers] = useState<Member[]>([]);
  // Firestoreから部員情報を取得
  useEffect(() => {
    const collectionRef = collection(db, "users");
    // リアルタイムリスナーを設定
    const unsubscribe = onSnapshot(collectionRef, async () => {
      try {
        const newMembers = await getAllUser();
        if (newMembers) {
          setMembers(newMembers); // 状態を更新
        } else {
          console.warn("部員情報が取得できませんでした。");
        }
      } catch (error) {
        console.error("部員情報の取得に失敗しました:", error);
      }
    });
    // クリーンアップ関数を返すことで、コンポーネントがアンマウントされるときにリスナーを解除
    return () => unsubscribe();
  }, []); // マウント時にのみ実行

  //lineIdを取得
  const [lineId, setLineId] = useState<string | null>(null);
  useEffect(() => {
    if (members.length > 0) {
      const fetchLineId = async () => {
        setLineId(await initLiff());
        // lineId が members に存在しない場合、ポップアップを表示
        if (lineId && !members.some((member) => member.lineId === lineId)) {
          setIsRegistrationPopupVisible(true);
        } else {
          setIsRegistrationPopupVisible(false);
        }
      };
      fetchLineId();
    }
  }, [members, lineId]);

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
  // 予約情報を追加する関数
  const handleReservationAdd = (newReservations: Reservation[]) => {
    setReservations((prev) => [...prev, ...newReservations]);
  };
  //バンドを管理
  const [bands, setBands] = useState<Band[]>([]);

  useEffect(() => {
    const collectionRef = collection(db, "bands");
    const unsubscribe = onSnapshot(collectionRef, async() => {
      try {
        const newBands = await getAllBands();
        if (newBands) {
          setBands(newBands);
        } else {
          console.warn("バンド情報が取得できませんでした。");
        }
      } catch (error) {
        console.error("バンド情報の取得に失敗しました:", error);
      }
    });

    // クリーンアップ関数
    return () => unsubscribe();
  }, []); // membersが変更されたときに再実行

  //　選択している時間帯を管理(Hourに渡しやすい型)
  const [selectedHours, setSelectedHours] = useState<boolean[][]>(
    Array.from({ length: daysOfWeek.length }, () =>
      Array(timeSlots.length).fill(false)
    )
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
  useEffect(() => {
    setSelectedReservations((prev) =>
      selectedHours.map((day, dayIndex) =>
        day.map((time, timeIndex) => {
          if (time) {
            return [...prev[dayIndex][timeIndex]];
          } else {
            return [];
          }
        })
      )
    );
  }, [selectedHours]);
  //予約をクリックした時のハンドラ
  const handleReservationClick = (
    dayIndex: number,
    timeIndex: number,
    id: string
  ) => {
    setSelectedReservations((prev) => {
      // 深いコピーを作成
      const newSelectedReservations = prev.map((day) =>
        day.map((timeSlot) => [...timeSlot])
      );
      const index = newSelectedReservations[dayIndex][timeIndex].indexOf(id);
      if (index > -1) {
        newSelectedReservations[dayIndex][timeIndex].splice(index, 1);
      } else {
        newSelectedReservations[dayIndex][timeIndex].push(id);
      }
      return newSelectedReservations;
    });
  };

  // 予約ポップアップの表示状態を管理
  const [isReservationPopupVisible, setIsReservationPopupVisible] =
    useState(false);
  // 予約ボタンをクリックしたときのハンドラ
  const handleReserve = () => {
    //Hourが選択されているときのみポップアップを表示
    if (selectedHours.some((hours) => hours.includes(true))) {
      setIsReservationPopupVisible(true);
    } else {
      Swal.fire({
        icon: "warning",
        title: "エラー",
        text: "予約する日時を選択してください",
        confirmButtonText: "OK",
      });
    }
  };

  //登録画面の表示状態を管理
  const [isRegistrationPopupVisible, setIsRegistrationPopupVisible] =
    useState(false);

  const getName = (lineId: string) => {
    const member = members.find((member) => member.lineId === lineId);
    return member ? member.name : "名前が登録されていません";
  };

  // 編集ポップアップの表示状態を管理
  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
  const handleEdit = () => {
    if (
      selectedReservations.some((day) => day.some((time) => time.length > 0))
    ) {
      setIsEditPopupVisible(true);
    } else {
      Swal.fire({
        icon: "warning",
        title: "エラー",
        text: "編集する予約を選択してください",
        confirmButtonText: "OK",
      });
    }
  };

  // バンドポップアップの表示状態を管理
  const [isBandPopupVisible, setIsBandPopupVisible] = useState(false);

  return (
    <div>
      {lineId && (
        <div className="p-5">
          <Header></Header>
          <HamburgerMenu members={members} />
          <Calendar
            name={getName(lineId)}
            reservations={reservations}
            selectedHours={selectedHours}
            onHourClick={handleHourClick}
          />
          <ReservationDisplay
            reservations={reservations}
            selectedHours={selectedHours}
            selectedReservations={selectedReservations}
            onReservationClick={handleReservationClick}
          />

          <button
            className="fixed bottom-24 right-8 p-2 bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center"
            onClick={handleReserve}
          >
            予約
          </button>

          <button
            className="fixed bottom-8 right-8 p-2 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center"
            onClick={handleEdit}
          >
            編集
          </button>

          <button
            className="fixed bottom-40 right-8 p-2 bg-red-500 text-white rounded-full w-14 h-14 flex items-center justify-center whitespace-nowrap "
            onClick={() => setIsBandPopupVisible(true)}
          >
            バンド
          </button>

          {isReservationPopupVisible && (
            <ReservationPopup
              myLineId={lineId}
              members={members}
              selectedHours={selectedHours}
              onSubmit={handleReservationAdd}
              onClose={() => setIsReservationPopupVisible(false)}
            />
          )}

          {isEditPopupVisible && (
            <EditReservationPopup
              myLineId={lineId} // lineIdを渡す
              members={members} // 部員情報を渡す
              name={getName(lineId)} // 名前を渡す
              reservations={reservations} // 予約情報を渡す
              selectedReservations={selectedReservations} // 選択された予約情報を渡す
              onClose={() => setIsEditPopupVisible(false)}
            />
          )}

          {isRegistrationPopupVisible && (
            <RegistrationPopup
              lineId={lineId}
              members={members}
              onClose={() => setIsRegistrationPopupVisible(false)}
            />
          )}

          {isBandPopupVisible && (
            <BandPopup
              myLineId={lineId}
              members={members}
              bands={bands}
              onClose={() => setIsBandPopupVisible(false)}
            />
          )}
        </div>
      )}
      {!lineId && (
        <div className="flex justify-center items-center h-screen">
          <div>ロード中...</div>
        </div>
      )}
    </div>
  );
}

export default App;
