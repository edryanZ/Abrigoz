import { useState } from "react";
import { listHiddenContent, restoreHiddenContent } from "../../../core/privacy/ContentVisibilityService.js";

export default function HiddenContentSettings() {
  const [items, setItems] = useState(listHiddenContent);
  return <div className="hidden-content-settings"><h3>Conteúdos ocultos</h3>
    {!items.length ? <p>Nenhum conteúdo reapresentado está oculto.</p> : <ul>{items.map((item) => <li key={item.id}>
      <span>{item.label}</span><button type="button" className="config-button secondary" onClick={() => {
        restoreHiddenContent(item.id); setItems(listHiddenContent());
      }}>Mostrar novamente</button></li>)}</ul>}
  </div>;
}
