interface TitleProps {
  text: string;
}

import React from "react";

const Title: React.FC<TitleProps> = ({ text }) => {
  return (
    <div className="w-full flex justify-start">
      <h1 className="text-3xl ">{text.toUpperCase()}</h1>
    </div>
  );
};

export default Title;
