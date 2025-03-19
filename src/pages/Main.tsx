import { Link, useNavigate } from "react-router-dom";
import { useLineId } from "../context/LineIdContext"; // 修正: LineIdConstext -> LineIdContext
import { initLiff } from "../liff/liffService";
import { useEffect, useState } from "react";

const Main = () => {
  const { setLineId } = useLineId();
  const [loading, setLoading] = useState(true); // ローディング状態を管理
  const [error, setError] = useState<string | null>(null); // エラーメッセージを管理
  const [redirectPage, setRedirectPage] = useState<string | null>(null); // リダイレクト先のページを管理
  const navigate = useNavigate(); // useNavigateフックを使用

  useEffect(() => {
    const fetchLineId = async () => {
      try {
        const lineId = await initLiff();
        setLineId(lineId);
        if (lineId) {
          const storedRedirectPage = localStorage.getItem("redirectPage");
          if (storedRedirectPage) {
            setRedirectPage(storedRedirectPage); // リダイレクト先をセット
            localStorage.removeItem("redirectPage");
          }
        }
      } catch (err) {
        setError("LINE IDの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchLineId();
  }, [setLineId]);

  useEffect(() => {
    if (redirectPage) {
      navigate(`/${redirectPage}`); // 自動リダイレクトを実行
    }
  }, [redirectPage, navigate]);

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
    </div>
  );
};

export default Main;
