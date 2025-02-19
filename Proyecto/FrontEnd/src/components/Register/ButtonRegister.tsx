import { Link } from "react-router-dom";

interface MyButtonRegisterProps{
    text: string;
    to: string;
}

const ButtonRegister = ({ text, to }:MyButtonRegisterProps) => {
    return (
        <Link to={to}>
            <button className=" bg-gray-200/75 hover:bg-white relative py-2 px-4 rounded-md group 
            hover:pr-16 transition-all cursor-pointer
            duration-300 ease-in-out">
                {text} <span className="absolute left-0 opacity-0 group-hover:opacity-100 
                group-hover:left-40 group-hover:font-bold text-xl transition-all 
                duration-300 ease-in-out">{'>'}</span>
            </button>
        </Link>
    );
}

export default ButtonRegister;