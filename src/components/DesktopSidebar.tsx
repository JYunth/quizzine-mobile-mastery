import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils"; // Import cn for potential future use if needed
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

export const DesktopSidebar = (): JSX.Element => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string): boolean => {
    return currentPath === path;
  };
  
  return (
    <Sidebar className="hidden md:flex border-r"> {/* Add right border */}
      <SidebarHeader className="p-4">
        <h1 className="text-xl font-bold">Quizzine</h1>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu className="space-y-1"> {/* Add vertical space between items */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/")}>
              <Link to="/" className="flex items-center gap-x-3"> {/* Add flex, align, gap */}
                <Home size={20} />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/bookmarks")}>
              <Link to="/bookmarks" className="flex items-center gap-x-3"> {/* Add flex, align, gap */}
                <BookMarked size={20} />
                <span>Bookmarks</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/stats")}>
              <Link to="/stats" className="flex items-center gap-x-3"> {/* Add flex, align, gap */}
                <BarChart size={20} />
                <span>Stats</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/settings")}>
              <Link to="/settings" className="flex items-center gap-x-3"> {/* Add flex, align, gap */}
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

// No default export needed, using named export above
