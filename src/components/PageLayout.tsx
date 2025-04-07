
import { useIsMobile } from "@/hooks/use-mobile";
import { ReactNode } from "react";
import BottomNavigation from "./BottomNavigation";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  hideNav?: boolean;
}

const PageLayout = ({ children, title, hideNav = false }: PageLayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {title && (
        <header className="py-4 px-6 border-b">
          <h1 className="text-xl font-semibold">{title}</h1>
        </header>
      )}
      
      <main className="flex-1 p-4 pb-20 md:pb-4">
        {children}
      </main>
      
      {!hideNav && (
        <BottomNavigation />
      )}
    </div>
  );
};

export default PageLayout;
