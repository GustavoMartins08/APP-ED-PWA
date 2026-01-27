
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import InstallPrompt from './InstallPrompt';
import NotebookLMWidget from './NotebookLM/NotebookLMWidget';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen pb-[env(safe-area-inset-bottom)]">
      <Header />
      <main className="flex-grow">
        <div key={location.pathname} className="animate-fade-in">
          {children}
        </div>
      </main>
      <InstallPrompt />
      <Footer />
      <NotebookLMWidget />
    </div>
  );
};

export default Layout;
