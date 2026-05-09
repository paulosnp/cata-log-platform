import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout() {
  return (
    <AuthProvider>
      <div className="flex min-h-dvh flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
