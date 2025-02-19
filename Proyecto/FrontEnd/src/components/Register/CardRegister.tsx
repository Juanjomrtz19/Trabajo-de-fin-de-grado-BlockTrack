import { useState, ReactNode } from "react";
import ButtonRegister from "./ButtonRegister";

interface MyCardRegisterProps {
    title: string;
    description: string;
    color: string;
    icon: ReactNode;
}


const CardRegister = ({title, description, color, icon}: MyCardRegisterProps) => {
    
    const bgColor = `color-mix(in oklab, ${color} 50%, transparent)`;

    return (
        <div className={` prose min-w-64 max-w-64 p-4 rounded-2xl 
         hover:shadow-2xl transition-all duration-300 ease-in-out shadow-red-500`}
         style={{background: bgColor, '--tw-shadow-color': color}}
         >
            <h2 >{title}</h2>
            <p >{description}</p>
            <div className="w-full flex items-center justify-center">{icon}</div>
            <div className="flex justify-center w-full pt-4"><ButtonRegister text="Registrate aquí" 
            to={`register${title}`}/></div>

        </div>
    );
}

export default CardRegister;