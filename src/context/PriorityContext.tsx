// PriorityContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { setPriorityFlag } from "../firebase/userService"; 
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";


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
  const docRef = doc(db, "setting", "priorityFlag"); // Firestoreのドキュメント参照を取得

  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const priorityFlag = docSnap.data()?.priorityFlag;
      setIsPriority(!!priorityFlag); // undefinedの場合はfalseに変換
    }
  });

  // クリーンアップ関数でリスナーを解除
  return () => unsubscribe();
}, []);


const togglePriority = async () => {
  const newPriorityState = !isPriority; // 状態を反転
  await setPriorityFlag(newPriorityState); // Firestoreに新しい状態を設定
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
