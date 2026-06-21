import { Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
      <p className="text-sm text-gray-500"></p>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <Bell className="w-4 h-4 text-gray-500" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`w-8 h-8 rounded-full ${user?.avatarColor || "bg-gray-800"} text-white text-xs font-semibold flex items-center justify-center cursor-pointer`}
            >
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => navigate("/me")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              className="text-red-500"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
