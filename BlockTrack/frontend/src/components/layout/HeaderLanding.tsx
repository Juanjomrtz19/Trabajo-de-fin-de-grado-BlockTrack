import { Link } from "react-router-dom";

const HeaderLanding = () => {
  return (
    <nav className="h-screen w-2/12 bg-background-light flex pl-4 pt-20 flex-col">
      <h1 className="text-3xl font-bold text-text-light">BLOCKTRACK</h1>
      <ul className="mt-10 space-y-4">
        <li>
          <Link to="/" className="text-text-light hover:text-primary-light">
            HOME
          </Link>
        </li>
        <li>
          <Link
            to="/about"
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
      </ul>
    </nav>
  );
};
export default HeaderLanding;
