import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ROUTES from "../../core/constants/routes";

import Loading from "../../shared/feedback/Loading";
import NotFound from "../../modules/errors/NotFound";

const Welcome = lazy(() => import("../../modules/home/components/Welcome"));
const Lar = lazy(() => import("../../modules/home/Lar"));
const MomentoDoDia = lazy(() => import("../../modules/moment/MomentoDoDia"));
const PauseMode = lazy(() => import("../../modules/pause/PauseMode"));
const Capsules = lazy(() => import("../../modules/memory/Capsules"));

const Calendario = lazy(() => import("../../modules/calendar/Calendario"));
const Favoritos = lazy(() => import("../../modules/favorites/Favoritos"));
const Metas = lazy(() => import("../../modules/goals/Metas"));
const Habitos = lazy(() => import("../../modules/habits/Habitos"));
const Cartas = lazy(() => import("../../modules/letters/Cartas"));
const Sobre = lazy(() => import("../../modules/profile/Sobre"));

const Configuracoes = lazy(() =>
  import("../../modules/settings/Configuracoes")
);
const Diary = lazy(() => import("../../modules/diary/pages/Diary"));
const Statistics = lazy(() => import("../../modules/statistics/Statistics"));
const GlobalSearch = lazy(() => import("../../modules/search/GlobalSearch"));
const AdminAnalytics = lazy(() => import("../../modules/admin/AdminAnalytics"));
const ExportCenter = lazy(() => import("../../modules/export/ExportCenter"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path={ROUTES.WELCOME} element={<Welcome />} />
        <Route path={ROUTES.HOME} element={<Lar />} />
        <Route path={ROUTES.MOMENT} element={<MomentoDoDia />} />
        <Route path={ROUTES.PAUSE} element={<PauseMode />} />
        <Route path={ROUTES.CAPSULES} element={<Capsules />} />
        <Route path={ROUTES.CALENDAR} element={<Calendario />} />
        <Route path={ROUTES.FAVORITES} element={<Favoritos />} />
        <Route path={ROUTES.GOALS} element={<Metas />} />
        <Route path={ROUTES.HABITS} element={<Habitos />} />
        <Route path={ROUTES.LETTERS} element={<Cartas />} />
        <Route path={ROUTES.ABOUT} element={<Sobre />} />

        <Route
          path={ROUTES.SETTINGS}
          element={<Configuracoes />}
        />
        <Route path={ROUTES.DIARY} element={<Diary />} />
        <Route path={ROUTES.STATISTICS} element={<Statistics />} />
        <Route path={ROUTES.SEARCH} element={<GlobalSearch />} />
        <Route path={ROUTES.ADMIN_ACTIVITY} element={<AdminAnalytics />} />
        <Route path={ROUTES.EXPORT} element={<ExportCenter />} />

        {/* Endereços antigos continuam levando ao conteúdo preservado. */}
        <Route path="/diario" element={<Navigate to={ROUTES.DIARY} replace />} />
        <Route path="/calendario" element={<Navigate to={ROUTES.CALENDAR} replace />} />
        <Route path="/favoritos" element={<Navigate to={ROUTES.FAVORITES} replace />} />
        <Route path="/metas" element={<Navigate to={ROUTES.GOALS} replace />} />
        <Route path="/habitos" element={<Navigate to={ROUTES.HABITS} replace />} />
        <Route path="/estatisticas" element={<Navigate to={ROUTES.STATISTICS} replace />} />
        <Route path="/conquistas" element={<Navigate to={ROUTES.STATISTICS} replace />} />
        <Route path="/assistente" element={<Navigate to={ROUTES.MOMENT} replace />} />

        <Route
          path="/home"
          element={<Navigate to={ROUTES.HOME} replace />}
        />

        <Route
          path={ROUTES.NOT_FOUND}
          element={<NotFound />}
        />
      </Routes>
    </Suspense>
  );
}
