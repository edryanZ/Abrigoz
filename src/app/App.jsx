import "../shared/styles/App.css";
import { useCallback, useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";

import ErrorBoundary from "../shared/feedback/ErrorBoundary";
import AppProviders from "./providers/AppProviders";
import AppRoutes from "./router/AppRoutes";
import AnalyticsTracker from "../core/analytics/AnalyticsTracker";
import Ceu from "../shared/componentes/Ceu";
import OfflineStatus from "../shared/componentes/OfflineStatus";
import AbrigoSplash from "../shared/componentes/AbrigoSplash";
import AnalyticsNotice from "../shared/componentes/AnalyticsNotice";
import DeviceLock from "../shared/componentes/DeviceLock";
import { WorkspaceProvider } from "../shared/contexts/WorkspaceContext";
import {
  getWorkspaceMode,
  subscribeWorkspaceMode,
  WORKSPACE_MODES,
} from "../core/privacy/WorkspaceModeService";
import {
  getPinConfiguration,
  subscribeDeviceLock,
} from "../core/privacy/DevicePinService";

function WorkspaceRuntime({ ready, onSplashComplete }) {
  return (
    <AppProviders>
      <Ceu />
      <AnalyticsTracker />
      <OfflineStatus />

      {!ready && <AbrigoSplash onComplete={onSplashComplete} />}

      {ready && (
        <>
          <AnalyticsNotice />
          <AppRoutes />
        </>
      )}
    </AppProviders>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState(getWorkspaceMode);
  const [initialPin] = useState(getPinConfiguration);
  const [locked, setLocked] = useState(
    initialPin.enabled &&
      initialPin.autoLock === "reopen" &&
      workspaceMode === WORKSPACE_MODES.PERSONAL
  );

  const finishSplash = useCallback(() => setReady(true), []);

  useEffect(
    () =>
      subscribeWorkspaceMode((mode) => {
        setWorkspaceMode(mode);
        setReady(true);
      }),
    []
  );

  useEffect(() => subscribeDeviceLock(() => setLocked(true)), []);

  useEffect(() => {
    if (workspaceMode !== WORKSPACE_MODES.PERSONAL || locked) {
      return undefined;
    }

    const config = getPinConfiguration();

    if (!config.enabled || config.autoLock !== "minutes") {
      return undefined;
    }

    let timer;

    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(
        () => setLocked(true),
        config.timeoutMinutes * 60_000
      );
    };

    ["pointerdown", "keydown", "touchstart"].forEach((event) =>
      window.addEventListener(event, arm, { passive: true })
    );

    arm();

    return () => {
      window.clearTimeout(timer);

      ["pointerdown", "keydown", "touchstart"].forEach((event) =>
        window.removeEventListener(event, arm)
      );
    };
  }, [workspaceMode, locked]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <WorkspaceProvider mode={workspaceMode}>
          {locked && workspaceMode === WORKSPACE_MODES.PERSONAL ? (
            <DeviceLock onUnlock={() => setLocked(false)} />
          ) : (
            <WorkspaceRuntime
              key={workspaceMode}
              ready={ready}
              onSplashComplete={finishSplash}
            />
          )}
        </WorkspaceProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}