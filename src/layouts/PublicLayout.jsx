import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '../shared/components';

function PublicLayout() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="site-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default PublicLayout;