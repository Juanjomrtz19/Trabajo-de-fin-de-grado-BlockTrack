import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import NotProtetedRoutesLayout from "./layouts/NotProtectedRoutesLayout";
import Registro from "./pages/Registro";
import RegistroUsuario from "./pages/Registro/RegistroUsuario";
import RegisterUserTransportistaLayout from "./layouts/RegisterUserTransportistaLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={ <NotProtetedRoutesLayout />}>
        <Route index element={<Home />} />
        <Route path="register" element={<Registro />} />
      </Route>
      <Route path="/" element={ <RegisterUserTransportistaLayout />}>
        <Route path="register/usuario" element={<RegistroUsuario/>}/>
      </Route>
    </Routes>
  )
}

export default App;
