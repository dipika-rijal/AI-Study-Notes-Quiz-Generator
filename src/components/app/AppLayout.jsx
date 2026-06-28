import { useState } from "react";
import Sidebar from "./Sidebar";
import Home from "./Home";
import CreateNotes from "./CreateNotes";
import CreateQuiz from "./CreateQuiz";

export default function AppLayout({ user, logout }) {
  const [activePage, setActivePage] = useState("home");

  function renderPage() {
    if (activePage === "notes") {
      return <CreateNotes />;
    }

    if (activePage === "quiz") {
      return <CreateQuiz />;
    }

    return <Home user={user} setActivePage={setActivePage} />;
  }

  return (
    <div className="min-h-screen bg-[#fffaf3] text-[#15132b]">
      <div className="flex min-h-screen">
        <Sidebar
          user={user}
          logout={logout}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        <main className="min-h-screen flex-1 overflow-y-auto px-6 py-6 lg:px-10">
          <div className="mx-auto max-w-6xl">{renderPage()}</div>
        </main>
      </div>
    </div>
  );
}