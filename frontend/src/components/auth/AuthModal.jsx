import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
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
    <Modal
      isOpen={!!authMode}
      onClose={closeAuthModal}
      size="sm"
      closeOnOverlayClick={true}
      closeOnEscape={true}
    >
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
      <Button
        onClick={handleGoogleLogin}
        disabled={loading}
        variant="outline"
        fullWidth
        style={{ marginBottom: '20px' }}
      >
        <span style={{ fontSize: '18px', fontWeight: '900', marginRight: '8px' }}>G</span>
        Continue with Google
      </Button>

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
        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errorMessage ? undefined : undefined}
          disabled={loading}
          variant="default"
        />

        <Input
          type="password"
          label="Password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errorMessage ? undefined : undefined}
          disabled={loading}
          variant="default"
        />

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

        <Button
          type="submit"
          disabled={loading}
          loading={loading}
          variant="primary"
          fullWidth
        >
          {isSignup ? "Sign up" : "Login"}
        </Button>
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
    </Modal>
  );
}