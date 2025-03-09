import { Grid, Button } from "@mui/material";
import { useState } from "react";
import ErrorMessage from "../../components/formularios/ErrorMessage";
import { validDNI, validEmail, validPhone } from "../../utils/Forms/regularExpresions";
import { inputStyles, labelStyles } from "../../utils/Forms/inputStyles";
import AccountExist from "../../components/RegisterUser/AcountExist";

const RegistroUsuario = () => {

    type ErrorFormType = {
        errorEmpty: string | null;
        errorInvalidDni: string | null;
        errorInvalidPhone: string | null;
        errorInvalidEmail: string | null;
        errorNoMatchedPasswords: string | null;
    }

    const initialErrors = {
        errorEmpty: null,
        errorInvalidDni: null,
        errorInvalidPhone: null, 
        errorInvalidEmail: null,
        errorNoMatchedPasswords: null
    }

    const [name, setName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [dni, setDni] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [checkPassword, setCheckPassword] = useState<string>('');
    const [errorForm, setErrorForm] = useState<ErrorFormType>(initialErrors);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const isEmpty = !name.trim() || !lastName.trim() || !dni.trim() || !email.trim() || !phone.trim() || !password.trim()
        || !checkPassword.trim();
        let hasError = false;
        
        if(isEmpty){
            setErrorForm((prev) => ({
                ...prev,
                errorEmpty: "Este campo no puede estar vacío"
            }));
            hasError=true;
        } else {
            setErrorForm((prev) => ({
                ...prev,
                errorEmpty:null
            }))
        }

        if(!validDNI(dni)){
            setErrorForm((prev) => ({
                ...prev,
                errorInvalidDni: "Formato de dni incorrecto (8 CIFRAS Y 1 LETRA)"
            }))
            hasError=true;
        } else {
            setErrorForm((prev) => ({
                ...prev,
                errorInvalidDni:null
            }))
        }

        if(!validPhone(phone)){
            setErrorForm((prev) => ({
                ...prev,
                errorInvalidPhone: "Formato de telefono incorrecto"
            }))
            hasError=true;
        } else {
            setErrorForm((prev) => ({
                ...prev,
                errorInvalidPhone:null
            }))
        }

        if(!validEmail(email)){
            setErrorForm((prev) => ({
                ...prev,
                errorInvalidEmail: "Formato de email incorrecto"
            }))
            hasError=true;
        } else {
            setErrorForm((prev) => ({
                ...prev,
                errorInvalidEmail: null
            }))
        }

        if(password !== checkPassword){
            setErrorForm((prev) => ({
                ...prev,
                errorNoMatchedPasswords: "Contraseñas no coinciden"
            }))
            hasError=true;
        } else {
            setErrorForm((prev) => ({
                ...prev,
                errorNoMatchedPasswords: null
            }))
        }
        
        if (hasError) return;

        setErrorForm(initialErrors);
        setName('');
        setLastName('');
        setDni('');
        setPhone('');
        setEmail('');
        setPassword('');
        setCheckPassword('');
    }
    
    return(
        <div className="flex flex-col w-full">

            <AccountExist />

            <div className="w-full flex justify-center -z-0">
                <form className="mt-16 w-4/6" onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        <Grid item xs={6} sx={{position: 'relative'}}>
                            <label className={labelStyles}>Nombre *</label>
                            <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputStyles} 
                            />
                            {errorForm.errorEmpty && !name.trim() && (<ErrorMessage text={errorForm.errorEmpty}/>)}
                        </Grid>

                        <Grid item xs={6} sx={{position: 'relative'}}>
                            <label className={labelStyles}>Apellidos *</label>
                            <input 
                            type="text" 
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className={inputStyles} 
                            />
                            {errorForm.errorEmpty && !lastName.trim() && (<ErrorMessage text={errorForm.errorEmpty}/>)}
                        </Grid>

                        <Grid item xs={12} sx={{position: 'relative'}}>
                            <label className={labelStyles}>DNI *</label>
                            <input 
                            type="text"
                            value={dni}
                            onChange={(e) => setDni(e.target.value)} 
                            className={inputStyles} 
                            />
                            {errorForm.errorEmpty && !dni.trim() && (<ErrorMessage text={errorForm.errorEmpty}/>)}
                            {errorForm.errorInvalidDni && (<ErrorMessage text={errorForm.errorInvalidDni}/>)}
                        </Grid>

                        <Grid item xs={6} sx={{position: 'relative'}}>
                            <label className={labelStyles}>Teléfono *</label>
                            <input 
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)} 
                            className={inputStyles} 
                            />
                            {errorForm.errorEmpty && !phone.trim() && (<ErrorMessage text={errorForm.errorEmpty}/>)}
                            {errorForm.errorInvalidPhone && (<ErrorMessage text={errorForm.errorInvalidPhone}/>)}
                        </Grid>

                        <Grid item xs={6} sx={{position: 'relative'}}>
                            <label className={labelStyles}>Email *</label>
                            <input 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="text" 
                            className={inputStyles} 
                            />
                            {errorForm.errorEmpty && !email.trim() && (<ErrorMessage text={errorForm.errorEmpty}/>)}
                            {errorForm.errorInvalidEmail && (<ErrorMessage text={errorForm.errorInvalidEmail}/>)}
                        </Grid>

                        <Grid item xs={12} sx={{position: 'relative'}}>
                            <label className={labelStyles}>Contraseña *</label>
                            <input 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password" 
                            className={inputStyles} 
                            />
                            {errorForm.errorEmpty && !password.trim() && (<ErrorMessage text={errorForm.errorEmpty}/>)}
                        </Grid>

                        <Grid item xs={12} sx={{position: 'relative'}}>
                            <label className={labelStyles}>Confirmar contraseña *</label>
                            <input 
                            value={checkPassword}
                            onChange={(e) => setCheckPassword(e.target.value)}
                            type="password" 
                            className={inputStyles} 
                            />
                            {errorForm.errorEmpty && !checkPassword.trim() && (<ErrorMessage text={errorForm.errorEmpty}/>)}
                            {errorForm.errorNoMatchedPasswords && (<ErrorMessage text={errorForm.errorNoMatchedPasswords}/>)}
                        </Grid>

                        <Grid item xs={12} sx={{position: 'relative'}}>
                            <div className="flex w-full justify-center">
                                <Button type="submit" variant="contained" sx={{backgroundColor: '#FF8484'}}> Enviar </Button>
                            </div>
                        </Grid>
                    </Grid>
                </form>
            </div>


        </div>
    );
}

export default RegistroUsuario;
