import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: "primary" | "secondary" | "accent" | "success" | "error";
  mode?: "light" | "dark";
  size?: "medium" | "small"; // 👈 nuevo prop
}

const Button: React.FC<ButtonProps> = ({
  className = "",
  children,
  variant = "primary",
  mode = "light",
  size = "medium", // 👈 por defecto medium
  disabled = false,
  ...props
}) => {
  const baseClasses = "rounded font-medium transition-colors duration-200";

  const sizeMap: Record<"medium" | "small", string> = {
    medium: "px-4 py-2 text-sm", // 👈 tamaño normal
    small: "px-2 py-1 text-xs", // 👈 tamaño reducido
  };

  const variantMap: Record<string, Record<string, string>> = {
    light: {
      primary: "bg-primary-light text-white hover:bg-secondary-light",
      accent:
        "bg-accent-light text-white hover:bg-border-light hover:text-accent-light",
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
      className={`cursor-pointer ${baseClasses} ${
        sizeMap[size]
      } ${variantClasses} ${disabled ? disabledClasses : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {typeof children === "string" ? children.toUpperCase() : children}
    </button>
  );
};

export default Button;
