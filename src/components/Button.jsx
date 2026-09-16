import React from 'react';
import { useStateContext } from '../contexts/ContextProvider';

const Button = ({
  icon,
  bgColor,
  color,
  bgHoverColor,
  size,
  text,
  borderRadius,
  width,
  onClick, // ✅ accept parent click
}) => {
  const { setIsClicked, initialState } = useStateContext();

  const handleClick = (e) => {
    // close popups
    setIsClicked(initialState);

    // run parent handler if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{ backgroundColor: bgColor, color, borderRadius }}
      className={`text-${size} p-3 w-${width} hover:drop-shadow-xl hover:bg-${bgHoverColor}`}
    >
      {icon} {text}
    </button>
  );
};

export default Button;
