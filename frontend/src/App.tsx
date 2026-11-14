import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import TopPage from "./pages/TopPage";

export default function App() {
  return (
    <>
      <SiteHeader />
      <main>
        <TopPage />
      </main>
      <SiteFooter />
    </>
  );
}
