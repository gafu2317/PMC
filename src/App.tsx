// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Meikou from "./pages/Meikou";
import Kinjyou from "./pages/Kinjyou";
import Main from "./pages/Main";
import { LineIdProvider } from "./context/LineIdContext";
import { BookingProvider } from "./context/BookingContext";

function App() {
  return (
    <LineIdProvider>
      <BookingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/Meikou" element={<Meikou />} />
            <Route path="/Kinjyou" element={<Kinjyou />} />
          </Routes>
        </BrowserRouter>
      </BookingProvider>
    </LineIdProvider>
  );
}
export default App;
