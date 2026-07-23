import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Loading from "../components/common/Loading";
import NotFound from "../pages/NotFound";

const Welcome = lazy(() => import("../pages/welcome"));
const Lar = lazy(() => import("../pages/lar"));
const Calendario = lazy(() => import("../pages/calendario"));
const Cartas = lazy(() => import("../pages/cartas"));
const Sobre = lazy(() => import("../pages/sobre"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/lar" element={<Lar />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/cartas" element={<Cartas />} />
        <Route path="/sobre" element={<Sobre />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}