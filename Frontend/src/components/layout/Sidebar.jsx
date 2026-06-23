import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  FolderKanban,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils"; // shadcn utility

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const links = isAdmin
    ? [
        { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/admin/users", icon: Users, label: "Employees" },
        { to: "/admin/boards", icon: FolderKanban, label: "Boards" },
      ]
    : [
        { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/user/boards", icon: FolderKanban, label: "Boards" },
        { to: "/my-tasks", icon: CheckSquare, label: "My Tasks" },
      ];

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col py-4 shrink-0">
      {/* Logo */}

      <Link to={isAdmin ? "/admin" : "/"}>
        <div className="px-4 mb-8 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <CheckSquare className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm leading-none text-foreground">
              TaskFlow
            </p>

            <p className="text-[10px] text-muted-foreground">
              Employee Task Management
            </p>
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mx-3 mt-4 p-3 bg-muted rounded-lg border">
        <p className="text-xs font-medium text-foreground">Workspace</p>

        <p className="text-[10px] text-muted-foreground mt-0.5">
          Minimal, focused, and organized.
        </p>
      </div>
    </aside>
  );
}
