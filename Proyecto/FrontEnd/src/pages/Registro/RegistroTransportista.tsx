import { inputStyles, labelStyles } from "../../utils/Forms/inputStyles";
import AccountExist from "../../components/RegisterUser/AcountExist";
import { useState } from "react";
import { Grid, Button } from "@mui/material";
import { validPhone, validEmail } from "../../utils/Forms/regularExpresions";
import ErrorMessage from "../../components/formularios/ErrorMessage";

const RegistroTransportista = () => {

    type ErrorFormType = {
        errorEmpty: string | null;
        errorInvalidPhone: string | null;
        errorInvalidEmail: string | null;
        errorNoMatchedPasswords: string | null;
    }

    const initialErrors = {
        errorEmpty: null,
        errorInvalidPhone: null, 
        errorInvalidEmail: null,
        errorNoMatchedPasswords: null
    }


    const [owner, setOwner] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [checkPassword, setCheckPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [errorForm, setErrorForm] = useState<ErrorFormType>(initialErrors);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let hasError = false;

        const isEmpty = !owner.trim() || !email.trim() || !phone.trim() || !password.trim()
        || !checkPassword.trim();

        if(isEmpty){
            setErrorForm((prev) => ({
                ...prev,
                errorEmpty: "Este campo no puede estar vacío"
            }));
            hasError = true;
        } else {
            setErrorForm((prev) => ({
                ...prev,
                errorEmpty: null
            }));
        }

        if(!validEmail(email)){
            setErrorForm((prev) => ({
                ...prev,
                errorInvalidEmail: "Formato de email incorrecto"
            }));
            hasError = true;
        } else {
            setErrorForm((prev) => ({
                ...prev,
                errorInvalidEmail: null
            }));
        }

        if(!validPhone(phone)){
            setErrorForm((prev) => ({
                ...prev,
                errorInvalidPhone: "Formato de teléfono incorrecto"
            }));
            hasError = true;
        } else {
            setErrorForm((prev) => ({
                ...prev,
                errorInvalidPhone: null
            }));
        }

        if(password !== checkPassword){
            setErrorForm((prev) => ({
                ...prev,
                errorNoMatchedPasswords: "Contraseñas no coinciden"
            }));
            hasError = true;
        } else {
            setErrorForm((prev) => ({
                ...prev,
                errorNoMatchedPasswords: null
            }))
        }

        if(hasError) return;

        setOwner('');
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
                        <label className={labelStyles}>Propietario del transporte *</label>
                        <input 
                        type="text"
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                        className={inputStyles} 
                        />
                        {errorForm.errorEmpty && !owner.trim() && (<ErrorMessage text={errorForm.errorEmpty}/>)}
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

export default RegistroTransportista;