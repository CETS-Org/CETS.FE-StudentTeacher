import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-primary-600 text-white">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-wide">CETS Student & Teacher</span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `hover:text-white/90 ${isActive ? 'underline font-semibold' : 'text-white'}`
            }
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/requests"
            className={({ isActive }) =>
              `hover:text-white/90 ${isActive ? 'underline font-semibold' : 'text-white'}`
            }
          >
            Requests
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `hover:text-white/90 ${isActive ? 'underline font-semibold' : 'text-white'}`
            }
          >
            Reports
          </NavLink>
          <NavLink
            to="/dev"
            className={({ isActive }) =>
              `hover:text-white/90 ${isActive ? 'underline font-semibold' : 'text-white'} text-primary-200`
            }
          >
            Dev
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
