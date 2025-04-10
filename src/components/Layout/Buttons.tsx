import React, { useState } from "react";
import {
  ReservationPopup,
  EditReservationPopup,
  RegistrationPopup,
  BandPopup,
} from "../../components/Popup";
import { Member, Band, Reservation } from "../../types/type";
import Swal from "sweetalert2";
// import { sendMessages } from "../../liff/liffService";
import { usePriority } from "../../context/PriorityContext";
import { isReservationExist } from "../../utils/utils";

interface ButtonsProps {
  lineId: string;
  members: Member[];
  reservations: Reservation[];
  selectedHours: boolean[][];
  selectedReservations: string[][][];
  bands: Band[];
  isKinjyou: boolean;
}

const Buttons: React.FC<ButtonsProps> = ({
  lineId,
  members,
  reservations,
  selectedHours,
  selectedReservations,
  bands,
  isKinjyou,
}) => {
  //登録画面の表示状態を管理
  const [isRegistrationPopupVisible, setIsRegistrationPopupVisible] =
    useState(false);
  // バンドポップアップの表示状態を管理
  const [isBandPopupVisible, setIsBandPopupVisible] = useState(false);
  // 予約ポップアップの表示状態を管理
  const [isReservationPopupVisible, setIsReservationPopupVisible] =
    useState(false);
  const { isPriority } = usePriority(); // Contextから状態を取得
  // 予約ボタンをクリックしたときのハンドラ
  const handleReserve = () => {
    //Hourが選択されているときのみポップアップを表示
    if (selectedHours.some((hours) => hours.includes(true))) {
      if (!isPriority && isReservationExist(reservations, selectedHours)) {
        Swal.fire({
          icon: "warning",
          title: "エラー",
          text: "すでに予約が存在します",
          confirmButtonText: "OK",
        });
        return;
      }
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
  // 編集ポップアップの表示状態を管理
  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
  // 編集ボタンをクリックしたときのハンドラ
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
  // LineIdを名前に変換
  const getName = (lineId: string) => {
    const member = members.find((member) => member.lineId === lineId);
    return member ? member.name : "名前が登録されていません";
  };

  // const handleNotification = () => {
  //   sendMessages("Uaad36f829cb1c10a72df296f112a16dd", "通知テスト");
  // };

  return (
    <div>
      {/* <button
        className="fixed bottom-56 right-8 p-2 bg-gray-500 text-white rounded-full w-14 h-14 flex items-center justify-center"
        onClick={handleNotification}
      >
        通知
      </button> */}
      <button
        className="fixed bottom-40 right-8 p-2 bg-red-500 text-white rounded-full w-14 h-14 flex items-center justify-center whitespace-nowrap "
        onClick={() => setIsBandPopupVisible(true)}
      >
        バンド
      </button>
      <button
        className="fixed bottom-24 right-8 p-2 bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center"
        onClick={handleReserve}
      >
        予 約
      </button>

      <button
        className="fixed bottom-8 right-8 p-2 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center"
        onClick={handleEdit}
      >
        編集
      </button>

      {isReservationPopupVisible && (
        <ReservationPopup
          myLineId={lineId}
          members={members}
          selectedHours={selectedHours}
          onClose={() => setIsReservationPopupVisible(false)}
          isKinjyou={isKinjyou}
        />
      )}

      {isEditPopupVisible && (
        <EditReservationPopup
          myLineId={lineId}
          members={members}
          name={getName(lineId)}
          reservations={reservations} 
          selectedReservations={selectedReservations} 
          onClose={() => setIsEditPopupVisible(false)}
          isKinjyou={isKinjyou}
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
  );
};

export default Buttons;
