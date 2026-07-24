import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ROUTES from "../../core/constants/routes";

import Loading from "../../shared/feedback/Loading";
import NotFound from "../../modules/errors/NotFound";

const Welcome = lazy(() => import("../../modules/home/components/Welcome"));
const Lar = lazy(() => import("../../modules/home/Lar"));

const Calendario = lazy(() => import("../../modules/calendar/Calendario"));
const Cartas = lazy(() => import("../../modules/letters/Cartas"));
const Sobre = lazy(() => import("../../modules/profile/Sobre"));

const Configuracoes = lazy(() =>
  import("../../modules/settings/Configuracoes")
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path={ROUTES.WELCOME} element={<Welcome />} />
        <Route path={ROUTES.HOME} element={<Lar />} />
        <Route path={ROUTES.CALENDAR} element={<Calendario />} />
        <Route path={ROUTES.LETTERS} element={<Cartas />} />
        <Route path={ROUTES.ABOUT} element={<Sobre />} />

        <Route
          path="/configuracoes"
          element={<Configuracoes />}
        />

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