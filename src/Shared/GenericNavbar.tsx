import { 
  LogOut, 
  KeyRound, 
  Menu, 
  X, 
  BookOpen, 
  ChevronDown,
  Settings, 
  HelpCircle
} from "lucide-react";
import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
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
import NotificationDialog, { type Notification } from "@/components/ui/NotificationDialog";
import { mockNotifications } from "@/data/mockNotifications";
import type { GenericNavbarProps } from "@/types/navbar";

// Re-export types for backward compatibility
export type { NavbarConfig } from "@/types/navbar";

export default function GenericNavbar({ 
    collapsed = false, 
    mobileOpen: _mobileOpen = false, 
    fullWidth = false,
    config 
}: GenericNavbarProps) {
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
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

    const handleMarkAsRead = (notificationId: string) => {
        setNotifications(prev => 
            prev.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notification => ({ ...notification, isRead: true }))
        );
    };

    return (
        <>
            {/* Main Navbar */}
            <nav className={`fixed top-0 right-0 z-50 border-b border-neutral-200 shadow-lg backdrop-blur-md bg-secondary-100 transition-all duration-300 ${
                fullWidth ? 'left-0' : (collapsed ? 'lg:left-16' : 'lg:left-64')
            } left-0`}>
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16">
                        
                        {/* Logo & Brand - Left Side */}
                        <div className="flex items-center">
                            <NavLink to="/" className="flex items-center space-x-3 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                                        CETS
                                    </h1>
                                    <p className="text-xs text-neutral-500 -mt-1">{config.portalName}</p>
                                </div>
                            </NavLink>
                        </div>

                        {/* Centered Desktop Navigation */}
                        <div className="flex-1 flex justify-center">
                            <nav className="hidden lg:flex items-center space-x-1">
                                {config.navigationItems.map((item) => (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        className={({ isActive }) =>
                                            `flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-primary-500 to-accent-600 text-white shadow-md'
                                                    : 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50'
                                            }`
                                        }
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </NavLink>
                                ))}
                            </nav>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-6">

                            {/* Notifications */}
                            <NotificationDialog 
                                notifications={notifications}
                                unreadCount={unreadCount}
                                onMarkAsRead={handleMarkAsRead}
                                onMarkAllAsRead={handleMarkAllAsRead}
                            />

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center space-x-3 p-2 rounded-xl hover:bg-neutral-100 transition-all focus:outline-none focus:ring-1 focus:ring-accent-500 focus:ring-offset-2">
                                    <div className="hidden sm:block text-right">
                                        <p className="text-sm font-semibold text-neutral-900">{config.userInfo.name}</p>
                                        <p className="text-xs text-neutral-500">{config.userInfo.role}</p>
                                    </div>
                                    <div className="relative">
                                        <Avatar className="h-10 w-10 ring-2 ring-primary-200">
                                            <AvatarImage src={config.userInfo.avatar || "https://github.com/shadcn.png"} alt="@user" />
                                            <AvatarFallback className="bg-gradient-to-br from-primary-500 to-accent-600 text-white font-semibold">
                                                {config.userInfo.initials}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-64 border-neutral-200 bg-white shadow-xl rounded-xl z-[60] p-2">
                                    <DropdownMenuLabel className="font-semibold text-neutral-900 px-3 py-2">
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={config.userInfo.avatar || "https://github.com/shadcn.png"} alt="@user" />
                                                <AvatarFallback>{config.userInfo.initials}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{config.userInfo.name}</p>
                                                <p className="text-xs text-neutral-500 font-normal">{config.userInfo.email}</p>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-neutral-200 my-2" />
                                    
                                    {/* Quick Stats */}
                                    {config.quickStats.length > 0 && (
                                        <>
                                            <div className="px-3 py-2 mb-2">
                                                <div className="grid grid-cols-2 gap-4 text-center">
                                                    {config.quickStats.map((stat, index) => (
                                                        <div key={index} className={`${stat.color} rounded-lg p-2`}>
                                                            <p className="text-lg font-bold text-primary-600">{stat.value}</p>
                                                            <p className="text-xs text-neutral-600">{stat.label}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <DropdownMenuSeparator className="bg-neutral-200 my-2" />
                                        </>
                                    )}

                                    {/* Menu Items */}
                                    {config.userMenuItems.map((item) => (
                                        <DropdownMenuItem 
                                            key={item.name}
                                            onClick={() => navigate(item.href)}
                                            className="flex items-center space-x-3 px-3 py-2 text-neutral-700 hover:bg-primary-50 hover:text-white rounded-lg cursor-pointer transition-all"
                                        >
                                            <item.icon className="w-4 h-4" />
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-xs text- hover:text-white">{item.description}</p>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}

                                    {/* Show authenticated user options only if not guest */}
                                    {config.userInfo.role !== "Guest" && (
                                        <>
                                            <DropdownMenuSeparator className="bg-neutral-200 my-2" />
                                            
                                            {/* Settings & Help */}
                                            <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2 text-neutral-700 hover:bg-primary-50 hover:text-white rounded-lg cursor-pointer transition-all">
                                                <Settings className="w-4 h-4" />
                                                <span>Settings</span>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2 text-neutral-700 hover:bg-primary-50 hover:text-white rounded-lg cursor-pointer transition-all">
                                                <HelpCircle className="w-4 h-4" />
                                                <span>Help & Support</span>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem 
                                                onClick={handleChangePassword} 
                                                className="flex items-center space-x-3 px-3 py-2 text-neutral-700 hover:bg-primary-50 hover:text-white rounded-lg cursor-pointer transition-all"
                                            >
                                                <KeyRound className="w-4 h-4" />
                                                <span>Change Password</span>
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator className="bg-neutral-200 my-2" />
                                            
                                            <DropdownMenuItem 
                                                onClick={handleLogoutClick} 
                                                className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 hover:text-white rounded-lg cursor-pointer transition-all"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Logout</span>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-neutral-200 bg-white shadow-xl">
                        <div className="px-4 py-6 space-y-4">
                            {/* Mobile Navigation */}
                            <nav className="space-y-2">
                                {config.navigationItems.map((item) => (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-primary-500 to-accent-600 text-white shadow-md'
                                                    : 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50'
                                            }`
                                        }
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-xs opacity-75">{item.description}</p>
                                        </div>
                                    </NavLink>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}
            </nav>

            {/* Logout Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={isLogoutDialogOpen}
                onClose={handleLogoutCancel}
                onConfirm={handleLogoutConfirm}
                title="Confirm Logout"
                message="Are you sure you want to logout? You will be redirected to the login page."
                confirmText="Logout"
                cancelText="Cancel"
                type="danger"
            />     
        </>
    );
}
