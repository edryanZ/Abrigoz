import "../styles/Diary.css";

import Navbar from "../../../shared/componentes/Navbar";
import PrivacyNotice from "../../../shared/componentes/PrivacyNotice";
import Container from "../../../shared/ui/Container";
import DiaryEditor from "../components/DiaryEditor";
import DiaryHeader from "../components/DiaryHeader";
import DiarySearch from "../components/DiarySearch";
import DiaryTimeline from "../components/DiaryTimeline";
import useDiary from "../hooks/useDiary";

export default function Diary() {
  const diary = useDiary();
  return (
    <>
      <Navbar />
      <Container>
        <main className="diary-page">
          <DiaryHeader />
          <PrivacyNotice />
          <DiaryEditor onSave={diary.save} />
          <DiarySearch value={diary.query} onChange={diary.setQuery} />
          <DiaryTimeline entries={diary.filtered} />
        </main>
      </Container>
    </>
  );
}
