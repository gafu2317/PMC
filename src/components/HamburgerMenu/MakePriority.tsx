// MakePriority.tsx
import React from "react";
import { usePriority } from "../../context/PriorityContext";

const MakePriority: React.FC = () => {
  const { isPriority, togglePriority } = usePriority(); // Contextから状態を取得

  return (
    <div>
      <div className="my-2 flex justify-center">
        <button
          onClick={togglePriority}
          className={`text-white rounded p-2 ${
            isPriority ? "bg-red-500" : "bg-blue-500"
          }`} // 状態に応じて色を変更
        >
          {isPriority ? "優先権を無効にする" : "優先権を有効にする"}
        </button>
      </div>
    </div>
  );
};

export default MakePriority;
