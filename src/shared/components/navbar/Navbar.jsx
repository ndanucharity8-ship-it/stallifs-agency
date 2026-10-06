import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

import logo from '../../../assets/stallifs_logo.png';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar__container">
        <Link
          to="/"
          className="navbar__brand"
          aria-label="Stallifs home"
          onClick={closeMenu}
        >
          <img
            src={logo}
            alt="STALLIFS"
            className="navbar__logo"
          />
        </Link>

        <nav
  id="main-navigation"
  className={`navbar__nav ${
    isMenuOpen ? 'navbar__nav--open' : ''
  }`}
  aria-label="Main navigation"
>
          <div className="navbar__links">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
              onClick={closeMenu}
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
              onClick={closeMenu}
            >
              Products
            </NavLink>

            <NavLink
              to="/quote"
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
              onClick={closeMenu}
            >
              Get a Quote
            </NavLink>

            <NavLink
              to="/apply-agent"
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
              onClick={closeMenu}
            >
              Apply Agent
            </NavLink>
          </div>

          <div className="navbar__actions">
            <Link
              to="/login"
              className="navbar__login"
              onClick={closeMenu}
            >
              Login
            </Link>

            <Link
              to="/register"
              className="navbar__cta"
              onClick={closeMenu}
            >
              Get Started
            </Link>
          </div>
        </nav>

        <button
          type="button"
          className="navbar__toggle"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;