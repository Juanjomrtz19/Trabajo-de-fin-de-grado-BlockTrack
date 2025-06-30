import { Link, useLocation } from "react-router-dom";
import Button from "../common/Button/Button";

interface Route {
  path: string;
  name: string;
  icon?: React.ReactNode;
}

interface NavBarPrivateProps {
  routes: Route[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavBarPrivate = ({ routes }: NavBarPrivateProps) => {
  const location = useLocation();

  return (
    <div className="h-full w-64 p-4 relative">
      <nav className="flex flex-col gap-4 mt-16">
        {routes.map((route) => (
          <Link
            key={route.path}
            to={route.path}
            className={`p-2 rounded transition-colors ${
              location.pathname === route.path
                ? "bg-secondary-light text-text-dark"
                : "text-white hover:bg-accent-light"
            }`}
          >
            {route.icon && <span className="mr-2">{route.icon}</span>}
            {route.name}
          </Link>
        ))}
      </nav>
      <Button variant="accent" className="absolute bottom-4">
        Logout
      </Button>
    </div>
  );
};

export default NavBarPrivate;
