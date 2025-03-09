import { Link } from "react-router-dom";

const AccountExist = () => {
    return(
        <div className="z-30">
        <div className="flex justify-center w-full h-full items-center">
            <h1 className="font-semibold text-3xl">Crear cuenta</h1>
        </div>
        <div className="flex justify-center w-full ">
            <p className="text-gray-400 text-lg">¿Ya tienes una cuenta? <span className="text-turquesa font-semibold"><Link to="/login">Accede</Link></span></p>
        </div>
    </div>
    );
}

export default AccountExist;