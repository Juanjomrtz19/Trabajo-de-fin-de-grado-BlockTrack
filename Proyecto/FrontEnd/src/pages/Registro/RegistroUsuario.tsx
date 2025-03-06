import { Grid2,TextField } from "@mui/material";
import { useState } from "react";
import HeaderRegisterUser from "../../components/RegisterUser/HeaderRegisterUser.js"

const RegistroUsuario = () => {
    const [username, setUsername] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState(0);
    const [password, setPassword] = useState('');
    
    
    return(
        <>
            <p>hola</p>
        </>
    );
}

export default RegistroUsuario;
