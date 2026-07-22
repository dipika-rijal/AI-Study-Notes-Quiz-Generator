import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./config/firebase";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import Process from "./components/landing/Process";
import CTA from "./components/landing/CTA";

import StartModal from "./components/modals/StartModal";
import AuthModal from "./components/auth/AuthModal";

import AppLayout from "./components/app/AppLayout";
import Home from "./components/app/Home";
import CreateNotes from "./components/app/CreateNotes";
import CreateQuiz from "./components/app/CreateQuiz";
import History from "./pages/History";
import FocusMode from "./pages/FocusMode";

import ProtectedRoute from "./components/routes/ProtectedRoute";
import GuestRoute from "./components/routes/GuestRoute";

function LandingPage({ setModalType, setAuthMode }) {
  return (
    <div className="min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed -left-32 top-20 h-96 w-96 rounded-full bg-[#10a37f]/20 blur-3xl" />
      <div className="pointer-events-none fixed -right-40 top-24 h-[420px] w-[420px] rounded-full bg-[#10a37f]/10 blur-3xl" />

      <Navbar openModal={setModalType} openAuthModal={setAuthMode} />

      <main>
        <Hero openModal={setModalType} />
        <Features />
        <Process />
        <CTA openModal={setModalType} />
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  const [modalType, setModalType] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    await signOut(auth);
  }

  if (!authReady) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="surface-card px-8 py-6 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#10a37f] to-[#05503e] text-white">
            ✦
          </div>
          <p className="font-black text-[var(--theme-glow-purple)]">Loading StudyGen AI...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <GuestRoute user={user}>
              <LandingPage
                setModalType={setModalType}
                setAuthMode={setAuthMode}
              />
            </GuestRoute>
          }
        />

        <Route
          path="/app"
          element={
            <ProtectedRoute user={user}>
              <AppLayout user={user} logout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home user={user} />} />
          <Route path="notes" element={<CreateNotes />} />
          <Route path="quiz" element={<CreateQuiz />} />
          <Route path="history" element={<History />} />
          <Route path="focus" element={<FocusMode />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={user ? "/app" : "/"} replace />}
        />
      </Routes>

      <StartModal
        modalType={modalType}
        user={user}
        closeModal={() => setModalType(null)}
        openAuthModal={setAuthMode}
      />

      <AuthModal
        authMode={authMode}
        closeAuthModal={() => setAuthMode(null)}
      />
    </>
  );
}