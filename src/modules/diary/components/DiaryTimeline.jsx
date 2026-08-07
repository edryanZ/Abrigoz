import DiaryCard from "./DiaryCard";
export default function DiaryTimeline({ entries }) { return <div className="diary-timeline">{entries.length ? entries.map((entry) => <DiaryCard key={entry.id} entry={entry} />) : <p>Nada guardado por aqui ainda.</p>}</div>; }
