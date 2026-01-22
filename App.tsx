
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ReloadPrompt from './components/ReloadPrompt';

import Home from './pages/Home';
import LatestNews from './pages/LatestNews';
import ArticleDetail from './pages/ArticleDetail';
import NewsletterDetail from './pages/NewsletterDetail';
import EditionDetail from './pages/EditionDetail';
import Newsletters from './pages/Newsletters';
import Editions from './pages/Editions';
import VideosPage from './pages/VideosPage';
import ColumnsPage from './pages/ColumnsPage';
import Advertise from './pages/Advertise';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import AboutUs from './pages/AboutUs';
import SubscribePremium from './pages/SubscribePremium';

const App: React.FC = () => {
  return (
    <Router>
      <ReloadPrompt />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ultimas-noticias" element={<LatestNews />} />
          <Route path="/newsletters" element={<Newsletters />} />
          <Route path="/edicoes" element={<Editions />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/colunas" element={<ColumnsPage />} />
          <Route path="/sobre" element={<AboutUs />} />
          <Route path="/contact" element={<Advertise />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/artigo/:id" element={<ArticleDetail />} />
          <Route path="/newsletter/:id" element={<NewsletterDetail />} />
          <Route path="/edicao/:id" element={<EditionDetail />} />
          <Route path="/subscribe-premium" element={<SubscribePremium />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
