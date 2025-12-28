import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/shared/layout/AppLayout";
import PromptsHub from "@/pages/PromptsHub";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
        <Route path="/" element={<PromptsHub />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
