import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: "primary" | "secondary" | "accent" | "success" | "error";
  mode?: "light" | "dark";
}

const Button: React.FC<ButtonProps> = ({
  className = "",
  children,
  variant = "primary",
  mode = "light",
  disabled = false,
  ...props
}) => {
  const baseClasses =
    "px-4 py-2 rounded font-medium transition-colors duration-200";

  const variantMap: Record<string, Record<string, string>> = {
    light: {
      primary: "bg-primary-light text-white hover:bg-secondary-light",
      accent: "bg-accent-light text-white hover:bg-border-light",
      success: "bg-success-light text-white hover:bg-green-700",
      error: "bg-error-light text-white hover:bg-red-600",
    },
    dark: {
      primary: "bg-primary-dark text-white hover:bg-blue-500",
      accent: "bg-accent-dark text-white hover:bg-orange-400",
      success: "bg-success-dark text-white hover:bg-green-400",
      error: "bg-error-dark text-white hover:bg-red-400",
    },
  };

  const variantClasses = variantMap[mode][variant];

  const disabledClasses = "opacity-50 cursor-not-allowed";

  return (
    <button
      className={`cursor-pointer ${baseClasses} ${variantClasses} ${
        disabled ? disabledClasses : ""
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {typeof children === "string" ? children.toUpperCase() : children}
    </button>
  );
};

export default Button;
