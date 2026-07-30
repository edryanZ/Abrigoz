import "../styles/Diary.css";
import Ceu from "../../../shared/componentes/Ceu"; import Navbar from "../../../shared/componentes/Navbar"; import Container from "../../../shared/ui/Container";
import DiaryHeader from "../components/DiaryHeader"; import DiaryEditor from "../components/DiaryEditor"; import DiarySearch from "../components/DiarySearch"; import DiaryTimeline from "../components/DiaryTimeline"; import useDiary from "../hooks/useDiary";
export default function Diary() { const diary = useDiary(); return <><Ceu /><Navbar /><Container><main className="diary-page"><DiaryHeader /><DiaryEditor onSave={diary.save} /><DiarySearch value={diary.query} onChange={diary.setQuery} /><DiaryTimeline entries={diary.filtered} /></main></Container></>; }
