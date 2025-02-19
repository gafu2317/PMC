import React, { useEffect, useState } from "react";
import { Member, Band } from "../../types/type";
import {
  DeleteMemberData,
  DeleteReservationData,
  EditReservationData,
  CreateReservationData,
  DeleteBandData,
  Calculate,
  AddFineData,
  CheckPaid,
  ChangePassword,
  MakePriority,
  LiveDay,
} from "../HamburgerMenu/index";
import { getPassword } from "../../firebase/userService";
import Swal from "sweetalert2";
import { AdminInstruction } from "../Popup";

interface HamburgerMenuProps {
  members: Member[];
  bands: Band[];
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ bands, members }) => {
  const [isOpen, setIsOpen] = useState(false); // メニューの開閉状態を管理
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 認証状態を管理
  const [password, setPassword] = useState(""); // パスワードを管理
  const [selectedAction, setSelectedAction] = useState<string | null>(null); // 選択されたアクションを管理
  const [correctPassword, setCorrectPassword] = useState<string>(""); // 正しいパスワードを管理
  const [isShow, setIsShow] = useState(false);

  const handleClick = () => {
    setIsShow(!isShow);
  };
  useEffect(() => {
    getPassword().then((password) => {
      if (password) {
        setCorrectPassword(password);
      }
    });
  }, []);
  const handleMenuClick = (action: string) => {
    if (selectedAction === action) {
      setSelectedAction(null);
    } else {
      setSelectedAction(action);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      Swal.fire({
        icon: "warning",
        title: "エラー",
        text: "パスワードが間違っています",
        confirmButtonText: "OK",
      });
    }
  };
  const actions = [
    "makePriority",
    "liveDay",
    "addFineData",
    "calculate",
    "checkPaid",
    "changePassword",
    "deleteMemberData",
    "deleteReservation",
    "editReservation",
    "createReservation",
    "deleteBandData",
  ];
  const renderForm = (action: string) => {
    if (!action) return null;
    switch (action) {
      case "makePriority":
        return <MakePriority />;
      case "deleteMemberData":
        return <DeleteMemberData members={members} />;
      case "deleteReservation":
        return <DeleteReservationData />;
      case "editReservation":
        return <EditReservationData members={members}/>;
      case "createReservation":
        return <CreateReservationData members={members}/>;
      case "deleteBandData":
        return <DeleteBandData bands={bands} />;
      case "addFineData":
        return <AddFineData members={members} />;
      case "checkPaid":
        return <CheckPaid members={members} />;
      case "changePassword":
        return <ChangePassword />;
      case "calculate":
        return <Calculate members={members} bands={bands} />;
      case "liveDay":
        return <LiveDay />;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* ハンバーガーメニュー */}
      <button
        className="absolute top1 left-1 p-1 flex w-7 h-7 flex-col items-center justify-center bg-gray-600 text-white rounded focus:outline-none"
        onClick={toggleMenu}
      >
        <div className="w-full h-0.5 bg-white mb-1"></div>
        <div className="w-full h-0.5 bg-white mb-1"></div>
        <div className="w-full h-0.5 bg-white"></div>
      </button>

      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={toggleMenu}
        />
      )}

      {/* メニューとパスワード入力フォーム */}
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 "
          onClick={toggleMenu}
        >
          {!isAuthenticated ? (
            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-lg rounded p-6"
              onClick={(e) => e.stopPropagation()} // クリックイベントの伝播を止める
            >
              <label className="mb-2 block">
                パスワードを入力してください:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 p-2 rounded mb-4 w-full"
                required
                onClick={(e) => e.stopPropagation()} // クリックイベントの伝播を止める
              />
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded w-full"
              >
                決定
              </button>
            </form>
          ) : (
            <div
              className="bg-white shadow-lg rounded p-4 w-4/5 h-3/5 overflow-y-auto"
              onClick={(e) => e.stopPropagation()} // クリックイベントの伝播を止める
            >
              {/* &timesは×ボタン */}
              <div className="flex justify-between items-center">
                <h2 className="flex-grow text-center text-lg font-semibold">
                  管理者メニュー
                </h2>
                <button
                  className="rounded-full w-4 h-4 flex items-center justify-center border border-black  mr-4"
                  onClick={handleClick}
                >
                  ?
                </button>
                <button
                  className="text-lg font-bold hover:text-gray-800 focus:outline-none"
                  onClick={toggleMenu}
                >
                  &times;
                </button>
              </div>
              <ul className="py-2">
                {actions.map((action) => (
                  <div>
                    <li
                      key={action}
                      className={`text-xl border border-gray-20 rounded p-1 mx-4 my-4 hover:bg-gray-200 ${
                        selectedAction === action ? "bg-gray-300" : ""
                      }`} // クリックされた項目の背景色を変更
                      onClick={() => handleMenuClick(action)}
                    >
                      {action === "makePriority" && "・優先権の有効化"}
                      {action === "deleteReservation" && "・予約データの削除"}
                      {action === "editReservation" && "・予約データの編集"}
                      {action === "createReservation" && "・予約データの追加"}
                      {action === "deleteMemberData" && "・部員データの削除"}
                      {action === "deleteBandData" && "・バンドデータの削除"}
                      {action === "addFineData" && "・罰金データ追加"}
                      {action === "checkPaid" && "・支払い確認"}
                      {action === "changePassword" && "・パスワード変更"}
                      {action === "calculate" && "・料金計算"}
                      {action === "liveDay" && "・ライブ日の設定"}
                    </li>
                    {/* 選択された項目に応じたフォームを表示 */}
                    {selectedAction === action && <div className="mt-2">{renderForm(action)}</div>}
                  </div>
                ))}
              </ul>
              {isShow && <AdminInstruction onClose={() => setIsShow(false)} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
