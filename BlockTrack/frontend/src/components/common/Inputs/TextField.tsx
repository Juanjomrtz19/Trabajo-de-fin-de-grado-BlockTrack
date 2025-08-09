import React from "react";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  errorMessage?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  className = "",
  errorMessage,
  ...props
}) => {
  const hasError = Boolean(errorMessage);

  return (
    <div className="mb-4">
      {label && (
        <label className="block mb-2 text-sm font-medium text-text">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          {...props}
          value={props.value ?? ""} // ✅ Protección contra undefined
          className={`
            w-full p-2 border rounded 
            ${hasError ? "border-error-light" : ""}
            ${
              props.disabled
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : ""
            }
            ${className}
          `}
        />

        {hasError && (
          <p className="absolute top-full mt-1 text-error-light text-xs left-0">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default TextField;
