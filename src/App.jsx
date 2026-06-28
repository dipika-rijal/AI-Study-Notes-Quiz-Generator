import { useEffect, useState } from "react";
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

export default function App() {
  const [modalType, setModalType] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    await signOut(auth);
  }

  if (user) {
    return <AppLayout user={user} logout={handleLogout} />;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#fffaf3] text-[#15132b]">
      <div className="pointer-events-none fixed -left-32 top-20 h-96 w-96 rounded-full bg-[#ffd8b6]/50 blur-3xl" />
      <div className="pointer-events-none fixed -right-40 top-24 h-[420px] w-[420px] rounded-full bg-[#6757ff]/10 blur-3xl" />

      <Navbar openModal={setModalType} openAuthModal={setAuthMode} />

      <main>
        <Hero openModal={setModalType} />
        <Features />
        <Process />
        <CTA openModal={setModalType} />
      </main>

      <Footer />

      <StartModal
        modalType={modalType}
        closeModal={() => setModalType(null)}
      />

      <AuthModal
        authMode={authMode}
        closeAuthModal={() => setAuthMode(null)}
      />
    </div>
  );
}