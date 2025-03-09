interface ErrorMessageProps{
    text: string
}

const ErrorMessage = ({text}: ErrorMessageProps) => {
    return(
      <p className="text-red-600 text-sm"> {text} </p>  
    );
}

export default ErrorMessage;