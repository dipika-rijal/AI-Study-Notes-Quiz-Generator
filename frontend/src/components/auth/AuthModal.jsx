import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";

export default function AuthModal({ authMode, closeAuthModal }) {
  const [mode, setMode] = useState(authMode || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  useEffect(() => {
    if (authMode) {
      setMode(authMode);
      setErrorMessage("");
      setEmail("");
      setPassword("");
    }
  }, [authMode]);

  if (!authMode) return null;

  function getFriendlyError(error) {
    if (error.code === "auth/email-already-in-use") return "This email already has an account. Try logging in.";
    if (error.code === "auth/invalid-credential")   return "Email or password is incorrect.";
    if (error.code === "auth/weak-password")         return "Password should be at least 6 characters.";
    if (error.code === "auth/popup-closed-by-user")  return "Google popup was closed before login finished.";
    return error.message;
  }

  async function handleEmailAuth(event) {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      closeAuthModal();
    } catch (error) {
      setErrorMessage(getFriendlyError(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setErrorMessage("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      closeAuthModal();
    } catch (error) {
      setErrorMessage(getFriendlyError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={closeAuthModal}
      style={{
        position: 'fixed', inset: 0, zIndex: 120,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          borderRadius: '28px',
          background: 'var(--theme-bg-secondary)',
          border: '1px solid var(--theme-glass-border)',
          padding: '36px',
          boxShadow: 'var(--theme-card-shadow)',
        }}
      >
        {/* Close */}
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute', top: '18px', right: '18px',
            width: '36px', height: '36px',
            borderRadius: '50%',
            background: 'var(--theme-surface)',
            border: '1px solid var(--theme-glass-border)',
            color: 'var(--theme-text-secondary)',
            fontSize: '18px', fontWeight: '900',
            cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            margin: '0 auto 16px',
            width: '56px', height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            display: 'grid', placeItems: 'center',
            fontSize: '24px', color: 'white',
            boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
          }}>
            ✦
          </div>
          <h2 style={{
            fontSize: '26px', fontWeight: '900', letterSpacing: '-0.03em',
            color: 'var(--theme-text-primary)', margin: '0 0 8px',
          }}>
            {isSignup ? "Create account" : "Welcome back"}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--theme-text-secondary)', margin: 0, fontWeight: '500' }}>
            {isSignup ? "Sign up to start using StudyGen AI." : "Login to continue studying smarter."}
          </p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            width: '100%', padding: '13px',
            borderRadius: '14px',
            border: '1px solid var(--theme-glass-border)',
            background: 'var(--theme-surface)',
            color: 'var(--theme-text-primary)',
            fontWeight: '700', fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            marginBottom: '20px',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: '900' }}>G</span>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--theme-glass-border)' }} />
          <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--theme-text-muted)' }}>
            or
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--theme-glass-border)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--theme-text-primary)' }}>
              Email
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '13px 16px',
                borderRadius: '12px',
                border: '1px solid var(--theme-glass-border)',
                background: 'var(--theme-bg-tertiary)',
                color: 'var(--theme-text-primary)',
                fontSize: '14px', fontWeight: '500',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--theme-glow-purple)';
                e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--theme-glass-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--theme-text-primary)' }}>
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '13px 16px',
                borderRadius: '12px',
                border: '1px solid var(--theme-glass-border)',
                background: 'var(--theme-bg-tertiary)',
                color: 'var(--theme-text-primary)',
                fontSize: '14px', fontWeight: '500',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--theme-glow-purple)';
                e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--theme-glass-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {errorMessage && (
            <div style={{
              padding: '12px 16px', borderRadius: '12px',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#ef4444',
              fontSize: '13px', fontWeight: '600',
            }}>
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              color: 'white',
              fontWeight: '800', fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 15px rgba(139,92,246,0.4)',
            }}
          >
            {loading ? "Please wait..." : isSignup ? "Sign up" : "Login"}
          </button>
        </form>

        {/* Switch mode */}
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--theme-text-secondary)' }}>
          {isSignup ? "Already have an account?" : "New to StudyGen AI?"}{" "}
          <button
            onClick={() => setMode(isSignup ? "login" : "signup")}
            style={{ background: 'none', border: 'none', color: 'var(--theme-glow-purple)', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}
          >
            {isSignup ? "Login" : "Create account"}
          </button>
        </p>
      </div>
    </div>
  );
}