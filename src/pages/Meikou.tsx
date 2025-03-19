//Meikou.tsx
import { useState, useEffect } from "react";
import { RegistrationPopup } from "../components/Popup";
import { Calendar, ReservationDisplay } from "../components/Calendar";
import { HamburgerMenu, Header, Buttons } from "../components/Layout";
import { Reservation, Member, Band } from "../types/type";
import {
  getAllReservations,
  getAllUser,
  getAllBands,
} from "../firebase/userService";
import { db } from "../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { daysOfWeek, timeSlots } from "../utils/utils";
import { PriorityProvider } from "../context/PriorityContext";
import {useLineId} from "../context/LineIdContext";

function Meikou() {
  //部員を管理
  const [members, setMembers] = useState<Member[]>([]);
  const {lineId} = useLineId();
  useEffect(() => {
    const collectionRef = collection(db, "users"); // リアルタイムリスナーを設定
    const unsubscribe = onSnapshot(collectionRef, async () => {
      try {
        const newMembers = await getAllUser();
        if (newMembers) {
          setMembers(newMembers);
          if (lineId) {
            // membersが空でも登録画面を表示
            setIsRegistrationPopupVisible(
              !newMembers.some((member) => member.lineId === lineId)
            );
          }
        } else {
          console.warn("部員情報が取得できませんでした。");
        }
      } catch (error) {
        console.error("部員情報の取得に失敗しました:", error);
      }
    });
    return () => unsubscribe();
  }, [lineId]); // lineIdの変更を監視

  // 予約情報を管理
  const [reservations, setReservations] = useState<Reservation[]>([]);
  useEffect(() => {
    const collectionRef = collection(db, "reservations"); // リアルタイムリスナーを設定
    const unsubscribe = onSnapshot(collectionRef, async () => {
      try {
        const newReservations = await getAllReservations();
        if (newReservations) {
          setReservations(newReservations);
        } else {
          console.warn("予約情報が取得できませんでした。");
        }
      } catch (error) {
        console.error("予約情報の取得に失敗しました:", error);
      }
    });
    return () => unsubscribe();
  }, []);

  //バンドを管理
  const [bands, setBands] = useState<Band[]>([]);
  useEffect(() => {
    const collectionRef = collection(db, "bands");
    const unsubscribe = onSnapshot(collectionRef, async () => {
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
    return () => unsubscribe();
  }, []);

  //　選択している時間帯を管理(Hourに渡しやすい型)
  const [selectedHours, setSelectedHours] = useState<boolean[][]>(
    Array.from({ length: daysOfWeek.length }, () =>
      Array(timeSlots.length).fill(false)
    )
  );
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
  const handleReservationClick = (
    dayIndex: number,
    timeIndex: number,
    id: string
  ) => {
    setSelectedReservations((prev) => {
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

  //登録画面の表示状態を管理
  const [isRegistrationPopupVisible, setIsRegistrationPopupVisible] =
    useState(false);

  const getName = (lineId: string) => {
    const member = members.find((member) => member.lineId === lineId);
    return member ? member.name : "名前が登録されていません";
  };
  return (
    <div>
      {lineId && (
        <div className="p-5">
          {/* <p>{lineId}</p> */}
          <Header></Header>
          <PriorityProvider>
            <HamburgerMenu bands={bands} members={members} />
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
            <Buttons
              lineId={lineId}
              members={members}
              reservations={reservations}
              selectedHours={selectedHours}
              selectedReservations={selectedReservations}
              bands={bands}
            />
          </PriorityProvider>
          {isRegistrationPopupVisible && (
            <RegistrationPopup
              lineId={lineId}
              members={members}
              onClose={() => setIsRegistrationPopupVisible(false)}
            />
          )}
        </div>
      )}
      {!lineId && (
        <div className="flex justify-center items-center h-screen">
          <div>ロード中...</div>
        </div>
      )}
      {lineId === null && (
        <div className="flex justify-center items-center h-screen">
          <div>LINE IDが取得できませんでした。</div>
        </div>
      )}
    </div>
  );
}

export default Meikou;
