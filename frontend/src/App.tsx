import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import TopPage from "./pages/TopPage";
import ShrineListPage from "./pages/ShrineListPage";
import ShrineDetailPage from "./pages/ShrineDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

/** ページが変わったら一番上へ（絞り込みでクエリだけ変わるときはそのまま） */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <SiteHeader />
      <main>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/shrines" element={<ShrineListPage />} />
          <Route path="/shrines/:id" element={<ShrineDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <SiteFooter />
    </>
  );
}
