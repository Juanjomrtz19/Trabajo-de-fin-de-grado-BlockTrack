import { Outlet } from "react-router-dom";
import HeaderRegisterUser from "../components/RegisterUser/HeaderRegisterUser";

const RegisterUserTransportistaLayout = () => {
    return(
        <div className="flex">
            <div className="w-5/12 h-screen">
                <HeaderRegisterUser />
            </div>

            <main className="flex flex-row w-7/12 h-screen justify-center items-center">
                <Outlet />
            </main>
        </div>
    )
}

export default RegisterUserTransportistaLayout;