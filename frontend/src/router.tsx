import {
  createBrowserRouter,
  data,
  isRouteErrorResponse,
  Outlet,
  ScrollRestoration,
  useNavigation,
  useRouteError,
  type LoaderFunctionArgs,
} from "react-router";
import { fetchAreas, fetchFeature, fetchFeatures, fetchLog, fetchLogs, fetchStations, fetchShrine, fetchShrines, fetchTop, NotFoundError } from "./api";
import { loadSaved } from "./saved";
import type { ShrineItem } from "./types";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import TopPage from "./pages/TopPage";
import ShrineListPage from "./pages/ShrineListPage";
import ShrineDetailPage from "./pages/ShrineDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import SavedPage from "./pages/SavedPage";
import AreasPage from "./pages/AreasPage";
import StationsPage from "./pages/StationsPage";
import FeaturesPage from "./pages/FeaturesPage";
import FeaturePage from "./pages/FeaturePage";
import LogsPage from "./pages/LogsPage";
import LogPage from "./pages/LogPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";

// ---------- loader ----------
// 画面を切り替える前にデータを取得する。取得中は今のページを表示したままにする。

async function load<T>(p: Promise<T>): Promise<T> {
  try {
    return await p;
  } catch (err) {
    if (err instanceof NotFoundError) throw data("Not Found", { status: 404 });
    throw err;
  }
}

export const topLoader = ({ request }: LoaderFunctionArgs) => load(fetchTop(request.signal));

export const shrineListLoader = ({ request }: LoaderFunctionArgs) =>
  load(fetchShrines(new URL(request.url).searchParams.toString(), request.signal));

export const shrineDetailLoader = ({ request, params }: LoaderFunctionArgs) =>
  load(fetchShrine(params.id ?? "", request.signal));

export const areasLoader = ({ request }: LoaderFunctionArgs) => load(fetchAreas(request.signal));

export const stationsLoader = ({ request }: LoaderFunctionArgs) => load(fetchStations(request.signal));

export const featuresLoader = ({ request }: LoaderFunctionArgs) => load(fetchFeatures(request.signal));

export const featureLoader = ({ request, params }: LoaderFunctionArgs) =>
  load(fetchFeature(params.id ?? "", request.signal));

export const logsLoader = ({ request }: LoaderFunctionArgs) => load(fetchLogs(request.signal));

export const logLoader = ({ request, params }: LoaderFunctionArgs) => load(fetchLog(params.id ?? "", request.signal));

/** 保存リスト：ブラウザに保存した ID で取得し、最近保存した順に並べる */
export const savedLoader = async ({ request }: LoaderFunctionArgs): Promise<ShrineItem[]> => {
  const ids = loadSaved();
  if (ids.length === 0) return [];
  const params = new URLSearchParams(ids.map((id) => ["id", id]));
  const res = await load(fetchShrines(params.toString(), request.signal));
  const order = new Map(ids.map((id, i) => [id, i]));
  return res.items.sort((a, b) => (order.get(b.id) ?? 0) - (order.get(a.id) ?? 0));
};

// ---------- レイアウト ----------

/** データ取得に時間がかかったときだけ、画面上部に細いバーを出す */
function NavigationProgress() {
  const busy = useNavigation().state !== "idle";
  return <div className="nav-progress" data-active={busy} aria-hidden="true" />;
}

function Layout() {
  return (
    <>
      <NavigationProgress />
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </>
  );
}

function RouteError() {
  const err = useRouteError();
  if (isRouteErrorResponse(err) && err.status === 404) return <NotFoundPage />;
  console.error(err);
  return <p className="container page-status">データを読み込めませんでした。時間をおいて再度お試しください。</p>;
}

const loading = <p className="container page-status">読み込み中…</p>;

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        // エラー時もヘッダー・フッターは残す
        errorElement: <RouteError />,
        children: [
          { index: true, element: <TopPage />, loader: topLoader, hydrateFallbackElement: loading },
          { path: "shrines", element: <ShrineListPage />, loader: shrineListLoader, hydrateFallbackElement: loading },
          { path: "shrines/:id", element: <ShrineDetailPage />, loader: shrineDetailLoader, hydrateFallbackElement: loading },
          { path: "areas", element: <AreasPage />, loader: areasLoader, hydrateFallbackElement: loading },
          { path: "stations", element: <StationsPage />, loader: stationsLoader, hydrateFallbackElement: loading },
          { path: "features", element: <FeaturesPage />, loader: featuresLoader, hydrateFallbackElement: loading },
          { path: "features/:id", element: <FeaturePage />, loader: featureLoader, hydrateFallbackElement: loading },
          { path: "logs", element: <LogsPage />, loader: logsLoader, hydrateFallbackElement: loading },
          { path: "logs/:id", element: <LogPage />, loader: logLoader, hydrateFallbackElement: loading },
          { path: "about", element: <AboutPage /> },
          { path: "contact", element: <ContactPage /> },
          { path: "privacy", element: <PrivacyPage /> },
          { path: "saved", element: <SavedPage />, loader: savedLoader, hydrateFallbackElement: loading },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
