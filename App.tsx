import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import ReloadPrompt from './components/ReloadPrompt';
import AnalyticsTracker from './components/AnalyticsTracker';

// Public Pages (Lazy Loaded)
const Home = React.lazy(() => import('./pages/Home'));
const LatestNews = React.lazy(() => import('./pages/LatestNews'));
const ArticleDetail = React.lazy(() => import('./pages/ArticleDetail'));
const NewsletterDetail = React.lazy(() => import('./pages/NewsletterDetail'));
const EditionDetail = React.lazy(() => import('./pages/EditionDetail'));
const Newsletters = React.lazy(() => import('./pages/Newsletters'));
const Editions = React.lazy(() => import('./pages/Editions'));
const VideosPage = React.lazy(() => import('./pages/VideosPage'));
const ColumnsPage = React.lazy(() => import('./pages/ColumnsPage'));
const Advertise = React.lazy(() => import('./pages/Advertise'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const AboutUs = React.lazy(() => import('./pages/AboutUs'));
const SubscribePremium = React.lazy(() => import('./pages/SubscribePremium'));

// Admin Imports (Lazy Loaded)
const AdminLogin = React.lazy(() => import('./pages/admin/Login'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const NewsList = React.lazy(() => import('./pages/admin/news/NewsList'));
const NewsForm = React.lazy(() => import('./pages/admin/news/NewsForm'));
const VideoList = React.lazy(() => import('./pages/admin/videos/VideoList'));
const VideoForm = React.lazy(() => import('./pages/admin/videos/VideoForm'));
const EditorialList = React.lazy(() => import('./pages/admin/editorials/EditorialList'));
const EditorialForm = React.lazy(() => import('./pages/admin/editorials/EditorialForm'));
const UserList = React.lazy(() => import('./pages/admin/users/UserList'));
const NewsletterList = React.lazy(() => import('./pages/admin/newsletters/NewsletterList'));
const NewsletterForm = React.lazy(() => import('./pages/admin/newsletters/NewsletterForm'));
const ColumnistList = React.lazy(() => import('./pages/admin/columnists/ColumnistList'));
const ColumnistForm = React.lazy(() => import('./pages/admin/columnists/ColumnistForm'));

import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';

import Skeleton from './components/ui/Skeleton';

const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-white pb-20">
    <div className="h-20 w-full bg-white border-b border-gray-100 flex items-center px-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Skeleton variant="rect" className="h-8 w-32" />
        <Skeleton variant="circle" className="h-10 w-10 hidden md:block" />
      </div>
    </div>
    <div className="container mx-auto px-4 py-8 space-y-8 animate-pulse">
      <div className="w-full bg-gray-100 rounded-[2rem] aspect-video md:aspect-[21/9]" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-[400px] bg-gray-100 rounded-[2.5rem]" />
        <div className="h-[400px] bg-gray-100 rounded-[2.5rem]" />
        <div className="h-[400px] bg-gray-100 rounded-[2.5rem] hidden lg:block" />
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <AnalyticsTracker />
      <ReloadPrompt />
      <Suspense fallback={<LoadingFallback />}>
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

              {/* Columnists Module */}
              <Route path="columnists" element={<ColumnistList />} />
              <Route path="columnists/:id" element={<ColumnistForm />} />

              {/* Users Module */}
              <Route path="users" element={<UserList />} />

              {/* Newsletter Module */}
              <Route path="newsletters" element={<NewsletterList />} />
              <Route path="newsletters/:id" element={<NewsletterForm />} />

              <Route path="" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
