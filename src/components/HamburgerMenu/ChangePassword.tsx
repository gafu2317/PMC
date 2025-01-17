import React, { useState } from "react";
import { changePassword } from "../../firebase/userService";
import Swal from "sweetalert2";

interface ChangePasswordProps {}

const ChangePassword: React.FC<ChangePasswordProps> = ({}) => {
  const [newPassword, setNewPassword] = useState<string>("");
  const handleSubmit = async () => {
    await changePassword(newPassword);
    setNewPassword("");
    Swal.fire({
      icon: "success",
      title: "変更完了",
      text: "パスワードを変更しました",
      confirmButtonText: "OK",
    });
  };
  return (
    <div>
      <h2>パスワードを変更</h2>
      <input
        className="border rounded p-1 my-2 w-full"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="新しいパスワード"
      />
      <div className="flex justify-end">
        <button
          className="bg-blue-500 text-white rounded p-1"
          onClick={handleSubmit}
        >
          変更
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
