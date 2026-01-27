
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import InstallPrompt from './InstallPrompt';
import NotebookLMWidget from './NotebookLM/NotebookLMWidget';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <InstallPrompt />
      <Footer />
      <NotebookLMWidget />
    </div>
  );
};

export default Layout;
