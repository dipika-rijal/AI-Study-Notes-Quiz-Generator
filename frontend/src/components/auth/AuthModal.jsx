import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";
import { Modal, Button, Input } from "../../design-system";

export default function AuthModal({ authMode, closeAuthModal }) {
  const [mode, setMode] = useState(authMode || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";

  useEffect(() => {
    if (authMode) { setMode(authMode); setErrorMessage(""); setEmail(""); setPassword(""); }
  }, [authMode]);

  if (!authMode) return null;

  function getFriendlyError(error) {
    if (error.code === "auth/email-already-in-use") return "This email already has an account. Try logging in.";
    if (error.code === "auth/invalid-credential") return "Email or password is incorrect.";
    if (error.code === "auth/weak-password") return "Password should be at least 6 characters.";
    if (error.code === "auth/popup-closed-by-user") return "Google popup was closed before login finished.";
    return error.message;
  }

  async function handleEmailAuth(event) {
    event.preventDefault(); setErrorMessage(""); setLoading(true);
    try {
      if (isSignup) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
      closeAuthModal();
    } catch (error) { setErrorMessage(getFriendlyError(error)); }
    finally { setLoading(false); }
  }

  async function handleGoogleLogin() {
    setErrorMessage(""); setLoading(true);
    try { await signInWithPopup(auth, googleProvider); closeAuthModal(); }
    catch (error) { setErrorMessage(getFriendlyError(error)); }
    finally { setLoading(false); }
  }

  const lightTokens = {
    '--color-bg-tertiary': '#f4f1f7', '--color-border': 'rgba(45, 37, 57, .13)',
    '--color-text-primary': '#211b28', '--color-text-secondary': '#695f73', '--color-text-muted': '#8c8394',
    '--theme-text-primary': '#211b28', '--theme-text-secondary': '#695f73', '--theme-text-muted': '#8c8394',
    '--theme-glass-border': 'rgba(45, 37, 57, .13)', '--theme-glow-purple': '#6d4ed6',
  };

  return <Modal isOpen={!!authMode} onClose={closeAuthModal} size="sm" closeOnOverlayClick closeOnEscape>
    <div style={lightTokens}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ margin: '0 auto 10px', width: '48px', height: '48px', borderRadius: '14px', background: '#f0eaff', border: '1px solid #d9c9ff', display: 'grid', placeItems: 'center', color: '#6547bd', boxShadow: '0 8px 24px rgba(89,61,164,.14)' }}><BookOpen size={22} strokeWidth={2.2} /></div>
        <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.03em', color: 'var(--theme-text-primary)', margin: '0 0 5px' }}>{isSignup ? "Create account" : "Welcome back"}</h2>
        <p style={{ fontSize: '14px', color: 'var(--theme-text-secondary)', margin: 0, fontWeight: '500' }}>{isSignup ? "Sign up to start using StudyGen AI." : "Login to continue studying smarter."}</p>
      </div>

      <Button onClick={handleGoogleLogin} disabled={loading} variant="outline" fullWidth style={{ marginBottom: '14px', color: '#30263b', borderColor: 'rgba(45,37,57,.18)' }}><span style={{ fontSize: '18px', fontWeight: '900', marginRight: '8px' }}>G</span>Continue with Google</Button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}><div style={{ flex: 1, height: '1px', background: 'var(--theme-glass-border)' }} /><span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--theme-text-muted)' }}>or</span><div style={{ flex: 1, height: '1px', background: 'var(--theme-glass-border)' }} /></div>

      <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Input type="email" label="Email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} variant="default" />
        <Input type="password" label="Password" placeholder="Minimum 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} variant="default" />
        {errorMessage && <div style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)', color: '#b42318', fontSize: '13px', fontWeight: '600' }}>{errorMessage}</div>}
        <Button type="submit" disabled={loading} loading={loading} variant="primary" fullWidth>{isSignup ? "Sign up" : "Login"}</Button>
      </form>

      <p style={{ margin: '14px 0 0', textAlign: 'center', fontSize: '13px', color: 'var(--theme-text-secondary)' }}>{isSignup ? "Already have an account?" : "New to StudyGen AI?"} <button onClick={() => setMode(isSignup ? "login" : "signup")} style={{ background: 'none', border: 'none', color: 'var(--theme-glow-purple)', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>{isSignup ? "Login" : "Create account"}</button></p>
    </div>
  </Modal>;
}
