import { Link } from "react-router-dom";
import { useLineId } from "../context/LineIdConstext";
import { initLiff } from "../liff/liffService";
import React, { useEffect, useState } from "react";

const Main = () => {
  const { setLineId } = useLineId();
  const [loading, setLoading] = useState(true); // ローディング状態を管理
  const [error, setError] = useState<string | null>(null); // エラーメッセージを管理

  useEffect(() => {
    const fetchLineId = async () => {
      try {
        const lineId = await initLiff(); // LINE IDを取得
        setLineId(lineId); // Contextに設定
      } catch (err) {
        setError("LINE IDの取得に失敗しました。"); // エラーハンドリング
      } finally {
        setLoading(false); // ローディングが完了
      }
    };

    fetchLineId();
  }, [setLineId]); // setLineIdを依存配列に追加

  if (loading) {
    return <p>LINE IDを取得中...</p>; // ローディング中のメッセージ
  }

  if (error) {
    return <p>{error}</p>; // エラーメッセージの表示
  }
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/Meikou">名工ページへ</Link>
          </li>
          <li>
            <Link to="/Kinjyou">金城ページへ</Link>
          </li>
        </ul>
      </nav>
      {/* 他のコンポーネントや内容をここに追加 */}
    </div>
  );
};

export default Main;
