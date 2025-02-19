import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import NotProtetedRoutesLayout from "./layouts/NotProtectedRoutesLayout";
import Registro from "./pages/Registro";

function App() {
  return (
    <Routes>
      <Route path="/" element={ <NotProtetedRoutesLayout />}>
        <Route index element={<Home />} />
        <Route path="register" element={<Registro />} />
      </Route>
    </Routes>
  )
}

export default App;
