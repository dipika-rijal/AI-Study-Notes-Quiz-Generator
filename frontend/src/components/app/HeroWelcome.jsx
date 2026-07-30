export default function HeroWelcome({ user }) {
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';

  return (
    <h1 className="text-3xl font-black tracking-tight text-[var(--theme-text-primary)] sm:text-4xl">
      Welcome, {displayName}
    </h1>
  );
}
