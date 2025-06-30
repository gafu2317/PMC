import React from "react";
import { useState, useEffect } from "react";
import { Reservation, Member } from "../../types/type";
import { useWeekDays, timeSlots, slots, slotsKinjyou, timeSlotsKinjyou } from "../../utils/utils";
import {
  deleteReservation,
  updateReservation,
  deleteReservationKinjyou,
  updateReservationKinjyou,
} from "../../firebase/userService";
import { MemberList } from "../Forms";
import Swal from "sweetalert2";

interface ReservationPopupProps {
  myLineId: string;
  members: Member[];
  name: string;
  onClose: () => void;
  selectedReservations: string[][][];
  reservations: Reservation[];
  isKinjyou: boolean;
}

const EditReservationPopup: React.FC<ReservationPopupProps> = ({
  members,
  onClose,
  selectedReservations,
  reservations,
  name,
  isKinjyou,
}) => {
  const weekDays = useWeekDays();
  const [newReservations, setNewReservations] =
    useState<Reservation[]>(reservations); //　予約の編集で表示する予約情報
  const [ids, setIds] = useState<string[]>([]); //予約の編集で表示する予約のID
  const [isJoinPopupVisible, setIsJoinPopupVisible] = useState<boolean>(false);
  // 選択されたメンバーを管理
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]); // 選択されたメンバーをMembersの配列で管理
  const handleAddSelectedMembers = (member: Member) => {
    setSelectedMembers(
      (prev) =>
        prev.includes(member)
          ? prev.filter((m) => m.lineId !== member.lineId) // lineIdでフィルタリング
          : [...prev, member] // メンバーを追加
    );
  };

  useEffect(() => {
    const newIds: string[] = [];
    selectedReservations.forEach((dayReservations) => {
      dayReservations.forEach((hourReservations) => {
        newIds.push(...hourReservations);
      });
    });
    setIds(newIds);
  }, [selectedReservations]);

  const joinReservations = () => {
    setNewReservations((prevReservations) => {
      let isError = false; // エラーフラグを初期化
      const newReservations = prevReservations.map((reservation) => {
        if (ids.includes(reservation.id)) {
          // 自分のlineIdが予約に含まれているかを確認
          const isMember = reservation.names.includes(name);
          // 自分が予約のメンバーであるときのみ処理を行う
          if (isMember) {
            selectedMembers.forEach((member) => {
              if (!reservation.names.includes(member.name)) {
                reservation.names.push(member.name);
                isKinjyou
                  ? updateReservationKinjyou(reservation.id, reservation.names)
                  : updateReservation(reservation.id, reservation.names);
              }
            });
          } else {
            isError = true; // エラーフラグをセット
          }
        }
        return reservation; // 予約を返す
      });
      // すべての予約を確認した後にエラーメッセージを表示
      if (isError) {
        Swal.fire({
          icon: "warning",
          title: "注意",
          text: "自分がメンバーの予約のみ招待できます",
          confirmButtonText: "OK",
        });
      }
      return newReservations; // 更新された予約リストを返す
    });
    setIsJoinPopupVisible(false);
  };

  const leaveReservations = () => {
    setNewReservations((prevReservations) => {
      const newReservations = prevReservations.map((reservation) => {
        if (ids.includes(reservation.id)) {
          if (reservation.names.includes(name)) {
            if (reservation.names.length > 1) {
              reservation.names = reservation.names.filter(
                (member) => member !== name
              );
              isKinjyou
                ? updateReservationKinjyou(reservation.id, reservation.names)
                : updateReservation(reservation.id, reservation.names);
            } else {
              Swal.fire({
                icon: "warning",
                title: "注意",
                text: "自分のみの予約を不参加にはできません。",
                confirmButtonText: "OK",
              });
            }
          }
        }
        return reservation;
      });
      return newReservations;
    });
  };
  const deleteReservations = () => {
    setNewReservations((prevReservations) => {
      //過去の予約や、当日の予約、自分の含まれていない予約は削除できない
      const isMyReservation = prevReservations.some(
        (reservation) =>
          ids.includes(reservation.id) && reservation.names.includes(name)
      );
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1); // 明日の日付に設定
      tomorrow.setHours(0, 0, 0, 0); // 明日の午前0時の時間を設定
      const isFutureReservation = prevReservations.some(
        (reservation) => reservation.date.getTime() >= tomorrow.getTime() // 明日以降の予約かどうかチェック
      );
      if (isMyReservation) {
        if (isFutureReservation) {
          const newReservations = prevReservations.filter(
            (reservation) => !ids.includes(reservation.id)
          );
          ids.forEach((id) => {
            isKinjyou ? deleteReservationKinjyou(id) : deleteReservation(id);
          });
          return newReservations;
        } else {
          Swal.fire({
            icon: "warning",
            title: "注意",
            text: "過去と当日の予約は削除できません",
            confirmButtonText: "OK",
          });
        }
      } else {
        Swal.fire({
          icon: "warning",
          title: "注意",
          text: "自分がメンバーの予約のみ削除できます",
          confirmButtonText: "OK",
        });
      }
      return prevReservations;
    });
  };

  return (
    <div>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        onClick={onClose}
      >
        <div
          className="bg-white  px-6 pb-6 pt-3 rounded shadow-md w-4/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-xl font-semibold text-center ">予約の編集</h2>
            <button
              className="text-lg font-bold hover:text-gray-800 focus:outline-none"
              onClick={onClose}
            >
              &times;
            </button>
          </div>
          <div className="border border-blue-200 rounded h-32 overflow-y-auto">
            <ul className="list-disc pl-5">
              {weekDays.map((day, dayIndex) => {
                return (isKinjyou?timeSlotsKinjyou:timeSlots).map((_, timeIndex) => {
                  const selectedHourReservations =
                    selectedReservations[dayIndex][timeIndex];
                  if (selectedHourReservations.length > 0) {
                    return (
                      <li key={dayIndex + timeIndex}>
                        <div>
                          {day.date} {isKinjyou?(slotsKinjyou[timeIndex]):(slots[timeIndex])}
                        </div>
                        <ul>
                          {selectedHourReservations.map((teamId, teamIndex) => {
                            const team = newReservations.find(
                              (reservation) => reservation.id === teamId
                            );
                            return (
                              <li key={teamIndex}>{team?.names.join(", ")}</li>
                            );
                          })}
                        </ul>
                      </li>
                    );
                  }
                });
              })}
            </ul>
          </div>
          <div className="flex justify-around mt-4">
            <button
              className="p-2 text-white rounded-full w-20 bg-red-500"
              onClick={deleteReservations}
            >
              予約削除
            </button>
            <button
              className="p-2 text-white rounded-full w-20 bg-gray-500"
              onClick={leaveReservations}
            >
              不参加
            </button>
            <button
              className="p-2 text-white rounded-full w-20 bg-green-500"
              onClick={() => setIsJoinPopupVisible(true)}
            >
              招待
            </button>
          </div>
          {isJoinPopupVisible && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
              onClick={() => setIsJoinPopupVisible(false)}
            >
              <div
                className="bg-white  px-6 pb-6 pt-3 rounded shadow-md w-4/5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold">
                    招待する人を選択してください
                  </h3>
                  <button
                    className="text-lg font-bold hover:text-gray-800 focus:outline-none"
                    onClick={onClose}
                  >
                    &times;
                  </button>
                </div>
                <MemberList
                  members={members}
                  selectedMembers={selectedMembers}
                  handleAddSelectedMembers={handleAddSelectedMembers}
                />
                <div className="flex justify-end mt-4">
                  <button
                    className="p-2 bg-blue-500  text-white rounded-full w-20"
                    onClick={joinReservations}
                  >
                    招待する
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditReservationPopup;
