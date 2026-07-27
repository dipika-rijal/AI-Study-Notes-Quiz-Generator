import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center bg-[var(--theme-bg-primary,#0d0d0d)]">
          <div className="mx-4 max-w-md rounded-xl border border-[var(--theme-glass-border,#2f2f2f)] bg-[var(--theme-bg-secondary,#171717)] p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-red-500/10 text-3xl">
              ⚠️
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--theme-text-primary,#e5e5e5)]">
              Something went wrong
            </h2>
            <p className="mb-6 text-sm text-[var(--theme-text-secondary,#a3a3a3)]">
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-[#10a37f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#05503e] active:scale-95"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
