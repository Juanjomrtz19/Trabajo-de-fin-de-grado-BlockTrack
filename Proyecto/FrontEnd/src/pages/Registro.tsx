import CardRegister from "../components/Register/CardRegister";
import Camion from "../components/svg/Camion";
import User from "../components/svg/User";


const Registro = () => {


    return(
        <div>
            <div className="flex-col p-4 md:flex-row flex items-center justify-center w-full gap-10 lg:h-[calc(100vh-224px)]">
                <CardRegister 
                title="Transportista" 
                description="Pon disponible tus transportes en la aplicación para que enviadores puedan usarlos"
                color="#FF8484"
                icon={<Camion />}
                />

                <CardRegister 
                title="Usuario" 
                description="Pon disponible tus transportes en la aplicación para que enviadores puedan usarlos"
                color="#4DCCBD"
                icon={<User />}
                />
            </div>
        </div>
    );
}

export default Registro;