
import { Link, useLocation } from "react-router-dom";
import { Home, BookMarked, BarChart, Settings } from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

const DesktopSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => {
    return currentPath === path;
  };
  
  return (
    <Sidebar className="hidden md:flex">
      <SidebarHeader className="p-4">
        <h1 className="text-xl font-bold">Quizzine</h1>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/")}>
              <Link to="/">
                <Home size={20} />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/bookmarks")}>
              <Link to="/bookmarks">
                <BookMarked size={20} />
                <span>Bookmarks</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
              <Link to="/dashboard">
                <BarChart size={20} />
                <span>Stats</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/settings")}>
              <Link to="/settings">
                <Settings size={20} />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">
          © 2025 Quizzine
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DesktopSidebar;
