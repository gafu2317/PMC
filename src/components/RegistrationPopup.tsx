import React from "react";

interface RegistrationPopupProps {
  onClose: () => void;
}

const RegistrationPopup: React.FC<RegistrationPopupProps> = ({ onClose }) => {
  return (
    <div>
      {" "}
      <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-bold">登録画面</h2>
          <p>このIDはまだ登録されていません。登録してください。</p>
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPopup;
