
import { Home, BookMarked, BarChart, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => {
    return currentPath === path;
  };
  
  return (
    <nav className="fixed bottom-0 left-0 w-full border-t bg-card shadow-md py-2 md:hidden">
      <div className="flex items-center justify-around">
        <NavItem 
          to="/" 
          icon={<Home className={isActive("/") ? "text-primary" : "text-muted-foreground"} size={24} />} 
          label="Home" 
          active={isActive("/")} 
        />
        <NavItem 
          to="/bookmarks" 
          icon={<BookMarked className={isActive("/bookmarks") ? "text-primary" : "text-muted-foreground"} size={24} />} 
          label="Bookmarks" 
          active={isActive("/bookmarks")} 
        />
        <NavItem 
          to="/dashboard" 
          icon={<BarChart className={isActive("/dashboard") ? "text-primary" : "text-muted-foreground"} size={24} />} 
          label="Stats" 
          active={isActive("/dashboard")} 
        />
        <NavItem 
          to="/settings" 
          icon={<Settings className={isActive("/settings") ? "text-primary" : "text-muted-foreground"} size={24} />} 
          label="Settings" 
          active={isActive("/settings")} 
        />
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavItem = ({ to, icon, label, active }: NavItemProps) => (
  <Link 
    to={to} 
    className={`flex flex-col items-center justify-center ${active ? "text-primary" : "text-muted-foreground"}`}
  >
    {icon}
    <span className={`text-xs mt-1 ${active ? "font-medium" : ""}`}>{label}</span>
  </Link>
);

export default BottomNavigation;
