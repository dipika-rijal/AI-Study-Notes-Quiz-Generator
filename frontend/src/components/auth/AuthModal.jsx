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
    if (error.code === "auth/email-already-in-use") {
      return "This email already has an account. Try logging in.";
    }

    if (error.code === "auth/invalid-credential") {
      return "Email or password is incorrect.";
    }

    if (error.code === "auth/weak-password") {
      return "Password should be at least 6 characters.";
    }

    if (error.code === "auth/popup-closed-by-user") {
      return "Google popup was closed before login finished.";
    }

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
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#15132b]/30 px-5 backdrop-blur-xl"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-md rounded-[34px] border border-purple-100 bg-white/95 p-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={closeAuthModal}
          className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-[#f3f0f9] text-xl font-black text-[#7c7497]"
        >
          ×
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#6757ff] to-[#9a7cff] text-2xl text-white shadow-lg shadow-purple-300">
            ✦
          </div>

          <h2 className="text-3xl font-black tracking-[-0.04em] text-[#15132b]">
            {isSignup ? "Create account" : "Welcome back"}
          </h2>

          <p className="mt-2 text-sm font-semibold text-[#8a83a5]">
            {isSignup
              ? "Sign up to start using StudyGen AI."
              : "Login to continue studying smarter."}
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mb-5 flex w-full items-center justify-center gap-3 rounded-full border border-purple-100 bg-white px-5 py-3 font-extrabold text-[#15132b] shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="text-xl">G</span>
          Continue with Google
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-purple-100" />
          <span className="text-xs font-black uppercase tracking-widest text-[#aaa3bd]">
            or
          </span>
          <div className="h-px flex-1 bg-purple-100" />
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-black text-[#15132b]">
              Email
            </label>

            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-purple-100 bg-[#fffaf3] px-4 py-3 font-semibold text-[#15132b] outline-none focus:border-[#6757ff]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-[#15132b]">
              Password
            </label>

            <input
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-purple-100 bg-[#fffaf3] px-4 py-3 font-semibold text-[#15132b] outline-none focus:border-[#6757ff]"
            />
          </div>

          {errorMessage && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-500">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-[#6757ff] to-[#8b5cf6] px-5 py-4 font-black text-white shadow-xl shadow-purple-300 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait..." : isSignup ? "Sign up" : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-semibold text-[#8a83a5]">
          {isSignup ? "Already have an account?" : "New to StudyGen AI?"}{" "}
          <button
            onClick={() => setMode(isSignup ? "login" : "signup")}
            className="font-black text-[#6757ff]"
          >
            {isSignup ? "Login" : "Create account"}
          </button>
        </p>
      </div>
    </div>
  );
}