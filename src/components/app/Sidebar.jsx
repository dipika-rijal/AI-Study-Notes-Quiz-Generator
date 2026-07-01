import { NavLink } from "react-router-dom";

export default function Sidebar({ user, logout }) {
  const displayName =
    user.displayName || user.email?.split("@")[0] || "Student";

  const email = user.email || "No email";

  const menuItems = [
    {
      to: "/app",
      label: "Home",
      icon: "▦",
      end: true,
    },
    {
      to: "/app/notes",
      label: "Create Notes",
      icon: "▤",
    },
    {
      to: "/app/quiz",
      label: "Create Quiz",
      icon: "◎",
    },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-[250px] flex-col border-r border-purple-100 bg-white/80 px-4 py-5 backdrop-blur-xl">
      <NavLink to="/app" end className="mb-6 flex items-center gap-3 text-left">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#6757ff] to-[#9a7cff] text-white shadow-lg shadow-purple-200">
          ✦
        </div>

        <div className="text-lg font-black tracking-tight">
          StudyGen <span className="text-[#6757ff]">AI</span>
        </div>
      </NavLink>

      <div className="mb-6 rounded-3xl border border-purple-100 bg-[#f7f2ff] p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#6757ff] to-[#b36cff] text-sm font-black text-white shadow-md shadow-purple-200">
            {displayName.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-[#15132b]">
              {displayName}
            </p>
            <p className="truncate text-xs font-semibold text-[#8a83a5]">
              {email}
            </p>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
                isActive
                  ? "bg-[#efe7ff] text-[#6757ff] shadow-md shadow-purple-100"
                  : "text-[#655d80] hover:bg-[#fff5ec] hover:text-[#15132b]"
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-purple-100 pt-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-[#9a93b3] transition hover:bg-red-50 hover:text-red-500"
        >
          ⇱ Sign Out
        </button>
      </div>
    </aside>
  );
}
