import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, CheckSquare, Users, Menu, LogOut, User, Settings, FolderOpen } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "BA", "TEAM_MEMBER"] }, // HR role excluded
    { path: "/tasks", label: "Tasks", icon: CheckSquare, roles: ["ADMIN", "MANAGER", "BA", "TEAM_MEMBER"] }, // HR role excluded
    { path: "/teammates", label: "Teammates", icon: Users, roles: ["ADMIN", "MANAGER", "BA", "HR"] }, // TEAM_MEMBER role excluded
  ];

  // Admin-only navigation items
  const adminNavItems = [
    { path: "/admin/projects", label: "Projects", icon: FolderOpen },
    { path: "/admin/users", label: "Users", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo Section */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src="public/lovable-uploads/karya_logo.png" 
                alt="K A R Y A" 
                className="h-12 w-auto transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </div>
            <span className="text-xl font-bold text-slate-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              K A R Y A 
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                // Conditionally render based on user role
                if (user?.role && item.roles.includes(user.role)) {
                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant={isActive(item.path) ? "default" : "ghost"}
                        className={cn(
                          "flex items-center space-x-2",
                          isActive(item.path) 
                            ? "bg-blue-600 hover:bg-blue-700 text-white" 
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  );
                }
                return null;
              })}
              
              {/* Admin Navigation Items */}
              {(user?.role === 'ADMIN' || user?.role === 'HR') && adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className={cn(
                        "flex items-center space-x-2",
                        isActive(item.path) 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">{user?.fullName}</span>
                  <span className="text-xs text-slate-500">({user?.role})</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm text-slate-600">
                  <div className="font-medium">{user?.fullName}</div>
                  <div className="text-xs text-slate-500">{user?.email}</div>
                  <div className="text-xs text-slate-500">Role: {user?.role}</div>
                  {user?.projectId && (
                    <div className="text-xs text-slate-500">Project: {user?.projectId}</div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm text-slate-600">
                  <div className="font-medium">{user?.fullName}</div>
                  <div className="text-xs text-slate-500">{user?.email}</div>
                  <div className="text-xs text-slate-500">Role: {user?.role}</div>
                  {user?.projectId && (
                    <div className="text-xs text-slate-500">Project: {user?.projectId}</div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                // Conditionally render based on user role for mobile
                if (user?.role && item.roles.includes(user.role)) {
                  return (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive(item.path) ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start flex items-center space-x-2",
                          isActive(item.path) 
                            ? "bg-blue-600 hover:bg-blue-700 text-white" 
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  );
                }
                return null;
              })}
              
              {/* Admin Navigation Items for Mobile */}
              {(user?.role === 'ADMIN' || user?.role === 'HR') && adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start flex items-center space-x-2",
                        isActive(item.path) 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};



