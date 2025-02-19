import { Link } from "react-router-dom";

interface MyButtonProps{
    text: string;
    enlace: string;
}

const Button = ({text, enlace}: MyButtonProps) => {
    return(
        <Link to={enlace}>
            <button className="px-4 py-2 bg-amber-500 text-blanco box-content cursor-pointer rounded-sm
            hover:border-blanco hover:bg-blanco hover:text-amber-500 transition-all duration-300 ease-in-out">
                {text}
            </button>
        </Link>
    )
}

export default Button;