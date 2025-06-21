import React from "react";

interface Option {
  label: string;
  value: string;
}

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  className?: string;
  errorMessage?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  className = "",
  errorMessage,
  ...props
}) => {
  const hasError = Boolean(errorMessage);

  return (
    <div className="mb-4">
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          className={`w-full p-2 border rounded bg-white text-gray-800
            ${hasError ? "border-error-light" : "border-gray-300"}
            ${className}
          `}
          {...props}
        >
          <option value="" disabled>
            Select an option
          </option>
          {options.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {hasError && (
          <p className="absolute top-full mt-1 text-error-light text-xs left-0">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default SelectField;
