import React from "react";
import { useState, useEffect } from "react";
import { Reservation } from "../types/type";
import { weekDays, timeSlots } from "../utils/utils";
import { deleteReservation, updateReservation } from "../firebase/userService";

interface ReservationPopupProps {
  name: string;
  onClose: () => void;
  selectedReservations: string[][][];
  reservations: Reservation[];
}

const EditReservationPopup: React.FC<ReservationPopupProps> = ({
  onClose,
  selectedReservations,
  reservations,
  name,
}) => {
  const [newReservations, setNewReservations] = useState<Reservation[]>(reservations);
  const [ids, setIds] = useState<string[]>([]);
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
      const newReservations = prevReservations.map((reservation) => {
        if (ids.includes(reservation.id)) {
          if (!reservation.names.includes(name)) {
            reservation.names.push(name);
            updateReservation(reservation.id, reservation.names);
          } 
        }
        return reservation;
      });
      return newReservations;
    });
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
              updateReservation(reservation.id, reservation.names);
            } else {
              alert("自分のみの予約からは削除されませんでした。");
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
        (reservation) => reservation.date.getTime() >= tomorrow.getTime() // 明日以降の予約をチェック
      );
      if (isMyReservation) {
        if (isFutureReservation) {
          const newReservations = prevReservations.filter(
            (reservation) => !ids.includes(reservation.id)
          );
          ids.forEach((id) => {
            deleteReservation(id);
          });
          return newReservations;
        } else {
          alert("過去と当日の予約dは削除できません");
        }
      } else {
        alert("自分がメンバーの予約のみ削除できます");
      }
      return prevReservations;
    });
  };

  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-4 rounded shadow-md w-80">
          <h2 className="text-xl font-semibold mb-4 text-center ">
            予約の編集
          </h2>
          <div className="border border-blue-200 rounded h-32 overflow-y-auto">
            <ul className="list-disc pl-5">
              {weekDays.map((day, dayIndex) => {
                return timeSlots.map((time, timeIndex) => {
                  const selectedHourReservations =
                    selectedReservations[dayIndex][timeIndex];
                  if (selectedHourReservations.length > 0) {
                    return (
                      <li key={dayIndex + timeIndex}>
                        <div>
                          {day.date} {time}~{timeSlots[timeIndex + 1]}
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
              className="p-2 text-black rounded-full w-20 bg-gradient-to-b from-green-300 to-green-500"
              onClick={joinReservations}
            >
              参加
            </button>
            <button
              className="p-2 text-black rounded-full w-20 bg-gradient-to-b from-blue-300 to-blue-500"
              onClick={leaveReservations}
            >
              不参加
            </button>
          </div>
          <div className="flex justify-around mt-4">
            <button
              className="p-2 text-black rounded-full w-20 bg-gradient-to-b from-gray-300 to-gray-400"
              onClick={onClose}
            >
              閉じる
            </button>

            <button
              className="p-2 text-black rounded-full w-20 bg-gradient-to-b from-red-400 to-red-500"
              onClick={deleteReservations}
            >
              予約削除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditReservationPopup;
