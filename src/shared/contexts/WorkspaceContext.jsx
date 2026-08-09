import { createContext, useContext } from "react";

import {
  WORKSPACE_MODES,
  endEphemeralWorkspace,
  getWorkspaceMode,
  setWorkspaceMode,
} from "../../core/privacy/WorkspaceModeService.js";
import { getPinConfiguration, requestDeviceLock } from "../../core/privacy/DevicePinService.js";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ mode, children }) {
  const changeMode = (nextMode) => {
    if (nextMode === WORKSPACE_MODES.PERSONAL && mode !== WORKSPACE_MODES.PERSONAL) {
      const next = endEphemeralWorkspace();
      if (getPinConfiguration().enabled) requestDeviceLock();
      return next;
    }
    return setWorkspaceMode(nextMode);
  };

  return <WorkspaceContext.Provider value={{
    mode,
    isPersonal: mode === WORKSPACE_MODES.PERSONAL,
    isVisitor: mode === WORKSPACE_MODES.VISITOR,
    isDemo: mode === WORKSPACE_MODES.DEMO,
    changeMode,
    current: getWorkspaceMode,
  }}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace precisa estar dentro de WorkspaceProvider.");
  return value;
}
