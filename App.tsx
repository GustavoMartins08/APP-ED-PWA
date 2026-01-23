
import React from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
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

// Admin Imports
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import NewsList from './pages/admin/news/NewsList';
import NewsForm from './pages/admin/news/NewsForm';
import VideoList from './pages/admin/videos/VideoList';
import VideoForm from './pages/admin/videos/VideoForm';
import EditorialList from './pages/admin/editorials/EditorialList';
import EditorialForm from './pages/admin/editorials/EditorialForm';
import UserList from './pages/admin/users/UserList';
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';

const App: React.FC = () => {
  return (
    <Router>
      <ReloadPrompt />
      <Routes>
        {/* Public Application Routes - With Header/Footer */}
        <Route element={<Layout><Outlet /></Layout>}>
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
        </Route>

        {/* Admin Routes - Standalone Layout */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* News Module */}
            <Route path="news" element={<NewsList />} />
            <Route path="news/:id" element={<NewsForm />} />

            {/* Video Module */}
            <Route path="videos" element={<VideoList />} />
            <Route path="videos/:id" element={<VideoForm />} />

            {/* Editorial Module */}
            <Route path="editorials" element={<EditorialList />} />
            <Route path="editorials/:id" element={<EditorialForm />} />

            {/* Users Module */}
            <Route path="users" element={<UserList />} />

            <Route path="" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
