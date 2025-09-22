import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, LogOut, KeyRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown-menu";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

export default function Navbar() {
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const navigate = useNavigate();
    const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
    };

    const handleLogoutConfirm = () => {
        // Clear any authentication tokens/data here
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // Close dialog and navigate to login
        setIsLogoutDialogOpen(false);
        navigate('/login');
    };

    const handleLogoutCancel = () => {
        setIsLogoutDialogOpen(false);
    };

    const handleChangePassword = () => {
        navigate('/change-password');
    };
  return (
    // Navbar cố định, full width, đồng bộ màu với Sidebar
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-between border-b border-sky-100 bg-sky-50 px-4 lg:px-6 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-base font-bold text-sky-700">CETS</span>
      </div>

      {/* Actions bên phải */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-md hover:bg-sky-100" type="button">
          <Bell className="h-5 w-5 text-blue-900/70" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            3
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8FBEDC] focus:ring-offset-2">
            <span className="hidden sm:block text-sm font-medium text-blue-900">Ngọc Hân</span>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
              <AvatarFallback>NH</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48 border-sky-100 bg-white z-[60]">
            <DropdownMenuLabel className="font-medium text-blue-900">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-sky-100" />
            <DropdownMenuItem className="text-slate-700 focus:bg-sky-100 focus:text-blue-900">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleChangePassword} className="text-slate-700 focus:bg-sky-100 focus:text-blue-900">
              <KeyRound className="mr-2 h-4 w-4" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogoutClick} className="text-slate-700 focus:bg-sky-100 focus:text-blue-900">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>  
        {/* Logout Confirmation Dialog */}
        <ConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will be redirected to the login page."
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
        />     
      </div>
    </nav>
  );
}
