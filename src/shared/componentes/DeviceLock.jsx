import "./DeviceLock.css";
import { useEffect, useRef, useState } from "react";
import { verifyDevicePin } from "../../core/privacy/DevicePinService.js";

export default function DeviceLock({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const valid = await verifyDevicePin(pin);
    setBusy(false);
    if (!valid) {
      setPin("");
      setError("PIN incorreto. Tente novamente.");
      inputRef.current?.focus();
      return;
    }
    setPin("");
    onUnlock();
  };

  return <main className="device-lock" aria-labelledby="device-lock-title">
    <form className="device-lock__card" onSubmit={submit}>
      <img src="/branding/favicon-32.png" alt="" aria-hidden="true" />
      <h1 id="device-lock-title">Abrigo bloqueado</h1>
      <p>Bloqueio do Abrigo neste dispositivo.</p>
      <label htmlFor="device-pin-unlock">PIN</label>
      <input ref={inputRef} id="device-pin-unlock" type="password" inputMode="numeric"
        autoComplete="off" pattern="[0-9]*" value={pin}
        onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 12))} />
      {error && <p className="device-lock__error" role="alert">{error}</p>}
      <button type="submit" disabled={busy || pin.length < 4}>{busy ? "Verificando…" : "Desbloquear"}</button>
      <small>O PIN controla o acesso pela interface. Ele não criptografa todos os dados locais.</small>
    </form>
  </main>;
}
