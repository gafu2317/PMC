// src/UserManagement.tsx
import React, { useState, useEffect } from "react";
import { addUser, getUsers, updateUser, deleteUser } from "./userService";
import { UserData } from "./types";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [name, setName] = useState("");
  const [lineId, setLineId] = useState("");
  const [fee, setFee] = useState<number | "">(""); // 初期値は空文字列
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // ユーザーを取得するエフェクト
  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getUsers();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  // フォームの送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && lineId && fee !== "") {
      // feeが空でないことを確認
      const newUser: UserData = { name, lineId, fee: Number(fee) }; // feeを数値に変換
      if (editingUserId) {
        await updateUser(editingUserId, newUser);
        setEditingUserId(null);
      } else {
        await addUser(newUser);
      }
      // ユーザーリストを再取得
      setUsers(await getUsers());
      setName("");
      setLineId("");
      setFee("");
    }
  };

  // ユーザー編集のハンドラ
  const handleEdit = (user: UserData) => {
    setEditingUserId(user.id!);
    setName(user.name);
    setLineId(user.lineId);
    setFee(user.fee); // feeは数値なのでそのまま設定
  };

  // ユーザー削除のハンドラ
  const handleDelete = async (id: string) => {
    await deleteUser(id);
    setUsers(users.filter((user) => user.id !== id));
  };

  return (
    <div>
      <h1>ユーザー管理</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前"
          required
        />
        <input
          value={lineId}
          onChange={(e) => setLineId(e.target.value)}
          placeholder="LINE ID"
          required
        />
        <input
          type="number"
          value={fee}
          onChange={
            (e) => setFee(e.target.value === "" ? "" : Number(e.target.value)) // 空文字か数値に変換
          }
          placeholder="料金"
          required
        />
        <button type="submit">{editingUserId ? "更新" : "ユーザー追加"}</button>
      </form>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.lineId} - {user.fee}円
            <button onClick={() => handleEdit(user)}>編集</button>
            <button onClick={() => handleDelete(user.id!)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;
