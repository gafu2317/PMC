// PriorityContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";

// Contextの作成
const PriorityContext = createContext<
  | {
      isPriority: boolean;
      togglePriority: () => void;
    }
  | undefined
>(undefined);

// Providerコンポーネント
export const PriorityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isPriority, setIsPriority] = useState<boolean>(false);

  const togglePriority = () => {
    Swal.fire({
      icon: "success",
      title: isPriority ? "無効にしました" : "有効にしました",
      showConfirmButton: false,
      timer: 1500,
    });
    setIsPriority((prev) => !prev);
  };

  useEffect(() => { 
    console.log("isPriority", isPriority);
  }, [isPriority]);

  return (
    <PriorityContext.Provider value={{ isPriority, togglePriority }}>
      {children}
    </PriorityContext.Provider>
  );
};

// Contextを利用するためのカスタムフック
export const usePriority = () => {
  const context = useContext(PriorityContext);
  if (!context) {
    throw new Error("usePriority must be used within a PriorityProvider");
  }
  return context;
};
