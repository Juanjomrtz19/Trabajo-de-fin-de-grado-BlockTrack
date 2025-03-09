import { Link } from "react-router-dom";

const HeaderRegisterUser = () => {
    return(
        <header className="flex bg-gradient-to-b from-rojoSalmon via-azulOscuro to-turquesa justify-center items-center flex-col p-4 w-full
        h-full">
            
            <div className="w-64 h-64 hover:scale-105 transition-all duration-300 ease-in-out">
                <Link to="/">
                    <img src="/assets/logo/color/logoColor.png" className="w-full h-full object-cover"/>
                </Link>
            </div>
            
            <div className="prose">
                <h1 className="text-3xl font-bold text-white">Bienvenido a BlockTrack</h1>
                <p className="text-white text-xl">Accede con tus credenciales o crea una cuenta</p>
            </div>
        </header>
    );
}

export default HeaderRegisterUser;