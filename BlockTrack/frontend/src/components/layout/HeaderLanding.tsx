import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const HeaderLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex h-screen w-64 bg-background-light pl-6 pt-20 flex-col flex-shrink-0">
        <h1 className="text-3xl font-bold text-text-light">BLOCKTRACK</h1>
        <ul className="mt-10 space-y-4">
          <li>
            <Link to="/" className="text-text-light hover:text-primary-light">
              HOME
            </Link>
          </li>
          <li>
            <Link
              to="/services"
              className="text-text-light hover:text-primary-light"
            >
              SERVICES
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="text-text-light hover:text-primary-light"
            >
              CONTACT
            </Link>
          </li>
          <li>
            <Link
              to="/login"
              className="text-text-light hover:text-primary-light"
            >
              LOGIN
            </Link>
          </li>
          <li>
            <Link
              to="/register"
              className="text-text-light hover:text-primary-light"
            >
              REGISTER
            </Link>
          </li>
          <li>
            <Link
              to="/consultar-pedido"
              className="text-text-light hover:text-primary-light"
            >
              CONSULTAR PEDIDO
            </Link>
          </li>
        </ul>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background-light shadow-lg">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-text-light">BLOCKTRACK</h1>
          <button
            onClick={toggleMenu}
            className="text-text-light hover:text-primary-light p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="bg-background-light border-t border-border-light">
            <ul className="flex flex-col px-4 py-4 space-y-3">
              <li>
                <Link
                  to="/"
                  className="block text-text-light hover:text-primary-light py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  HOME
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="block text-text-light hover:text-primary-light py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  SERVICES
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="block text-text-light hover:text-primary-light py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  CONTACT
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="block text-text-light hover:text-primary-light py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  LOGIN
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="block text-text-light hover:text-primary-light py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  REGISTER
                </Link>
              </li>
              <li>
                <Link
                  to="/consultar-pedido"
                  className="text-text-light hover:text-primary-light"
                >
                  CONSULTAR PEDIDO
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
};
export default HeaderLanding;
