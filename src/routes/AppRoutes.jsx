import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ROUTES from "../constants/routes";

import Loading from "../components/Loading";
import NotFound from "../pages/NotFound";

const Welcome = lazy(() => import("../pages/home/Welcome"));
const Lar = lazy(() => import("../pages/home/Lar"));

const Calendario = lazy(() => import("../pages/Calendario"));
const Cartas = lazy(() => import("../pages/Cartas"));
const Sobre = lazy(() => import("../pages/Sobre"));

const Configuracoes = lazy(() =>
  import("../pages/settings/Configuracoes")
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route
          path={ROUTES.WELCOME}
          element={<Welcome />}
        />

        <Route
          path={ROUTES.HOME}
          element={<Lar />}
        />

        <Route
          path={ROUTES.CALENDAR}
          element={<Calendario />}
        />

        <Route
          path={ROUTES.LETTERS}
          element={<Cartas />}
        />

        <Route
          path={ROUTES.ABOUT}
          element={<Sobre />}
        />

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