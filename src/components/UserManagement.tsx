// // src/UserManagement.tsx
// import React, { useState, useEffect } from "react";
// import { addUser, getUsers } from "./userService";
// import { UserData } from "./types";

// const UserManagement: React.FC = () => {
//   const [users, setUsers] = useState<UserData[]>([]);
//   const [name, setName] = useState("");

//   // ユーザーを取得するエフェクト
//   useEffect(() => {
//     const fetchUsers = async () => {
//       const data = await getUsers();
//       setUsers(data);
//     };
//     fetchUsers();
//   }, []);

//   // フォームの送信処理
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (name) {
//       const newUser: UserData = { name }; // 名前だけを登録
//       await addUser(newUser);
//       setUsers(await getUsers());
//       setName(""); // 入力をクリア
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <input
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="名前"
//           required
//         />
//         <button type="submit">ユーザー追加</button>
//       </form>
//       <h2>ユーザー一覧</h2>
//       <ul>
//         {users.map((user) => (
//           <li key={user.id}>{user.name}</li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default UserManagement;
