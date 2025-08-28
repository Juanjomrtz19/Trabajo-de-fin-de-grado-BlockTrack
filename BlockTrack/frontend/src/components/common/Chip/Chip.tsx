import { X } from "lucide-react";
import { cloneElement, isValidElement } from "react";

interface ChipProps {
  text: string;
  onDelete?: () => void;
  variant: "filled" | "outlined";
  color: "primary" | "secondary" | "success" | "error" | "warning";
  icon?: React.ReactNode;
}

const colors: { [key in ChipProps["color"]]: string } = {
  primary: "primary-light",
  secondary: "secondary-light",
  success: "success-light",
  error: "error-light",
  warning: "accent-light",
};

const Chip = ({ text, onDelete, variant, color, icon }: ChipProps) => {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs";
  const variants = {
    filled: `bg-${colors[color]} text-white`,
    outlined: `border border-${colors[color]} text-${colors[color]}`,
  };

  return (
    <span className={`${base} ${variants[variant]}`}>
      <span className={`leading-none `}>{text}</span>

      {isValidElement(icon) &&
        cloneElement(icon as React.ReactElement<any>, {
          size: 14,
          strokeWidth: 1.75,
          className: "ml-1",
        })}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Eliminar"
          className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1"
        >
          <X size={12} strokeWidth={2} />
        </button>
      )}
    </span>
  );
};

export default Chip;
