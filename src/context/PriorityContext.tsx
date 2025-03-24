// PriorityContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { setPriorityFlag, getPriorityFlag } from "../firebase/userService"; // ここで関数をインポート

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

  // 初期状態をFirestoreから取得
  useEffect(() => {
    const fetchPriorityFlag = async () => {
      const priorityFlag = await getPriorityFlag();
      setIsPriority(!!priorityFlag); // undefinedの場合はfalseに変換
    };
    fetchPriorityFlag();
  }, []);

  const togglePriority = async () => {
    const newPriorityState = !isPriority; // 状態を反転
    await setPriorityFlag(newPriorityState); // Firestoreに新しい状態を設定
    Swal.fire({
      icon: "success",
      title: newPriorityState ? "有効にしました" : "無効にしました",
      showConfirmButton: false,
      timer: 1500,
    });
    setIsPriority(newPriorityState); // 状態を更新
  };

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
