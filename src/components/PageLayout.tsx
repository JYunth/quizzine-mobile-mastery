
import { useIsMobile } from "@/hooks/use-mobile";
import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { DesktopSidebar } from "./DesktopSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  hideNav?: boolean;
}

export const PageLayout = ({ children, title, hideNav = false }: PageLayoutProps): JSX.Element => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {!hideNav && <DesktopSidebar />}
        
        <SidebarInset>
          {title && (
            <header className="py-4 px-6 border-b">
              <h1 className="text-xl font-semibold">{title}</h1>
            </header>
          )}
          
          <main className="flex-1 p-4 pb-20 md:pb-4">
            {children}
          </main>
          
          {!hideNav && <BottomNavigation />}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

// No default export needed, using named export above
