// BookingContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { setTwoWeeksFlag } from "../firebase/userService";
import { onSnapshot, doc } from "firebase/firestore"; 
import { db } from "../firebase/firebase";

interface BookingContextType {
  isTwoWeekBookingEnabled: boolean;
  toggleTwoWeekBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isTwoWeekBookingEnabled, setIsTwoWeekBookingEnabled] = useState(false);

  //初期状態をfirestoreから取得
  useEffect(() => {
    const docRef = doc(db, "setting", "twoWeekBookingFlag");

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const twoWeekBookingFlag = docSnap.data()?.twoWeekBookingFlag;
        setIsTwoWeekBookingEnabled(!!twoWeekBookingFlag);
      }
    });

    return () => unsubscribe();
  }
  , []);

  const toggleTwoWeekBooking = async () => {
    const newTwoWeekBookingState = !isTwoWeekBookingEnabled;
    await setTwoWeeksFlag(newTwoWeekBookingState);
    setIsTwoWeekBookingEnabled((prev) => !prev);
  };

  return (
    <BookingContext.Provider
      value={{ isTwoWeekBookingEnabled, toggleTwoWeekBooking }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
