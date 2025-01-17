import React, { useState } from "react";
import {
  ReservationPopup,
  EditReservationPopup,
  RegistrationPopup,
  BandPopup,
} from "../../components/Popup";
import { Member, Band, Reservation } from "../../types/type";
import Swal from "sweetalert2";

interface ButtonsProps {
  lineId: string;
  members: Member[];
  reservations: Reservation[];
  selectedHours: boolean[][];
  selectedReservations: string[][][];
  bands: Band[];
}

const Buttons: React.FC<ButtonsProps> = ({
  lineId,
  members,
  reservations,
  selectedHours,
  selectedReservations,
  bands,
}) => {
  //登録画面の表示状態を管理
  const [isRegistrationPopupVisible, setIsRegistrationPopupVisible] =
    useState(false);
  // バンドポップアップの表示状態を管理
  const [isBandPopupVisible, setIsBandPopupVisible] = useState(false);
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

  return (
    <div>
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
  );
};

export default Buttons;
