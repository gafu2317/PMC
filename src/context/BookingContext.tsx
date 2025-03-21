// BookingContext.tsx
import React, { createContext, useContext, useState } from "react";

interface BookingContextType {
  isTwoWeekBookingEnabled: boolean;
  toggleTwoWeekBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isTwoWeekBookingEnabled, setIsTwoWeekBookingEnabled] = useState(false);

  const toggleTwoWeekBooking = () => {
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
