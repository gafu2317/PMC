// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Meikou from "./pages/Meikou";
import Kinjyou from "./pages/Kinjyou";
import Main from "./pages/Main";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/Meikou" element={<Meikou />} />
        <Route path="/Kinjyou" element={<Kinjyou />} />
      </Routes>
    </Router>
  );
}
export default App;
