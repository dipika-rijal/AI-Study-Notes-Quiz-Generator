export const generateComponentCSS = () => `
  /* Cards */
  .card-glass {
    background: var(--theme-surface);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--theme-glass-border);
    border-radius: 24px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform;
  }
  
  html[data-theme='light'] .card-glass {
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.05);
  }

  /* Buttons */
  .btn-primary {
    background: linear-gradient(135deg, var(--theme-glow-purple), var(--theme-glow-cyan));
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.6);
  }

  .btn-secondary {
    background: var(--theme-surface);
    color: var(--theme-text-primary);
    border: 1px solid var(--theme-glass-border);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 12px 24px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .btn-secondary:hover {
    border-color: var(--theme-glow-purple);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
  }

  .btn-ghost {
    background: transparent;
    color: var(--theme-text-secondary);
    border: none;
    padding: 12px 24px;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  .btn-ghost:hover {
    color: var(--theme-text-primary);
    text-decoration: underline;
    text-decoration-color: var(--theme-glow-purple);
    text-underline-offset: 4px;
  }

  /* Inputs */
  .input-glass {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--theme-text-primary);
    border-radius: 12px;
    padding: 14px 16px;
    width: 100%;
    outline: none;
    transition: all 0.3s ease;
  }
  html[data-theme='light'] .input-glass {
    background: rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.08);
  }
  .input-glass:focus {
    border-color: var(--theme-glow-purple);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
  }
  .input-glass:focus-visible {
    outline: none;
  }
`;
