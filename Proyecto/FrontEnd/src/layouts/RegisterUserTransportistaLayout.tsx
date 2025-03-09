import { Outlet } from "react-router-dom";
import HeaderRegisterUser from "../components/RegisterUser/HeaderRegisterUser";

const RegisterUserTransportistaLayout = () => {
    return(
        <div className="flex">
            <div className="w-5/12 min-h-screen">
                <HeaderRegisterUser/>
            </div>

            <main className="flex flex-row w-8/12 min-h-screen justify-center items-center pt-20 pb-10 bg-blanco">
                <Outlet />
            </main>
        </div>
    )
}

export default RegisterUserTransportistaLayout;