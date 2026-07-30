import GlassCard from "../../../shared/ui/GlassCard";
export default function DiaryCard({ entry }) { return <GlassCard className="diary-card"><small>{new Date(entry.createdAt).toLocaleDateString("pt-BR")} · {entry.mood}</small><h3>{entry.title || "Sem título"}</h3><p>{entry.content}</p><span>{entry.tags}</span>{entry.favorite && <strong> Favorito</strong>}</GlassCard>; }
