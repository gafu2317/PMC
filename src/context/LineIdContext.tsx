// LineIdContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

// Contextの型を定義
interface LineIdContextType {
  lineId: string | null;
  setLineId: React.Dispatch<React.SetStateAction<string | null>>;
}

// Contextを作成
const LineIdContext = createContext<LineIdContextType | undefined>(undefined);

// Providerの型を定義
interface LineIdProviderProps {
  children: ReactNode; // childrenの型を指定
}

// Providerコンポーネント
export const LineIdProvider: React.FC<LineIdProviderProps> = ({ children }) => {
  const [lineId, setLineId] = useState<string | null>(null);

  return (
    <LineIdContext.Provider value={{ lineId, setLineId }}>
      {children}
    </LineIdContext.Provider>
  );
};

// Contextを使用するためのカスタムフック
export const useLineId = () => {
  const context = useContext(LineIdContext);
  if (context === undefined) {
    throw new Error("useLineId must be used within a LineIdProvider");
  }
  return context;
};
