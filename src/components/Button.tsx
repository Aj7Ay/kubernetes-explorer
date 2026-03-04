import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-lg font-bold transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "btn-primary-gradient text-white hover:scale-105 focus:ring-2 focus:ring-pdso-400 focus:ring-offset-2 focus:ring-offset-pdso-950",
    secondary: "bg-pdso-400 text-white hover:bg-pdso-500 hover:scale-105 focus:ring-2 focus:ring-pdso-400 shadow-lg shadow-pdso-500/25",
    outline: "border-2 border-pdso-600 text-pdso-200 hover:border-pdso-400 hover:text-pdso-300 focus:ring-pdso-500"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
