import { Link, NavLink, Outlet } from "react-router-dom";
import { BarChart3, Gauge, Plus, TrainFront } from "lucide-react";

const navItems = [
  { to: "/", label: "Campaigns", icon: Gauge },
  { to: "/create", label: "Create", icon: Plus },
  { to: "/metrics", label: "Metrics", icon: BarChart3 },
];

export function Shell() {
  return (
    <div className="min-h-screen bg-ink text-zinc-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-black/40 px-5 py-6 lg:block">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold">
          <span className="grid h-10 w-10 place-items-center rounded bg-rail text-black">
            <TrainFront size={22} />
          </span>
          ReRail
        </Link>
        <nav className="mt-10 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded px-3 py-2.5 text-sm transition ${
                  isActive ? "bg-rail text-black" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <header className="sticky top-0 z-10 border-b border-line bg-ink/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <TrainFront className="text-rail" size={22} />
            ReRail
          </Link>
          <nav className="flex gap-2">
            {navItems.map(({ to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `grid h-9 w-9 place-items-center rounded border border-line ${
                    isActive ? "bg-rail text-black" : "bg-zinc-950 text-zinc-300"
                  }`
                }
                title={to}
              >
                <Icon size={17} />
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
