import { Outlet } from "react-router-dom";
import Header from "../components/home/Header";


const NotProtectedRoutesLayout = () => {
    return (
        <>
        <Header 
        title="BlockTrack"
        description="Sigue o gestiona tus remesas de forma segura con ayuda de blockchain"
        />
        <main>
            <Outlet />
        </main>
        </>
    );
}

export default NotProtectedRoutesLayout;