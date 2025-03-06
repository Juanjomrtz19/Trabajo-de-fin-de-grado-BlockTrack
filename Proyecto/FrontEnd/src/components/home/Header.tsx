import Button from "./Button";
import { Link } from "react-router-dom";


interface MyHeaderProps {
    title: string;
    description: string;
}


const Header = ({title, description}: MyHeaderProps) => {

    return(
        <header className="bg-azulOscuro text-center w-full p-4 lg:text-left flex-col 
        lg:flex-row flex justify-center items-center lg:justify-between">
            
            <div className="max-w-48">
                <Link to="/">
                <img src="/assets/logo/color/logoColor.png" alt="logo BlockTrack" className="w-full h-full object-cover"/>
                </Link>
            </div>
  
            <div className="flex flex-col justify-center">
                <h1 className="text-blanco  text-6xl">{title}</h1>
                <p className="text-blanco pt-2 text-2xl">{description}</p>
            </div>

            <div className="flex justify-center items-center pt-6 lg:pt-0 gap-4">
                <Button enlace="login" text="Login"/>
                <Button enlace="register" text="Registro" />
            </div>
            
        </header>
    );
}

export default Header;