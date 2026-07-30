import DiaryCard from "./DiaryCard";
export default function DiaryTimeline({ entries }) { return <section className="diary-timeline"><h2>Histórico</h2>{entries.length ? entries.map((entry) => <DiaryCard key={entry.id} entry={entry} />) : <p>Nenhuma entrada encontrada.</p>}</section>; }
