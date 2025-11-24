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
    primary: "bg-violet-600 text-white hover:bg-violet-700 hover:scale-105 focus:ring-violet-500 shadow-lg shadow-violet-500/20",
    secondary: "bg-fuchsia-500 text-white hover:bg-fuchsia-600 hover:scale-105 focus:ring-fuchsia-500 shadow-lg shadow-fuchsia-500/20",
    outline: "border-2 border-slate-600 text-slate-300 hover:border-violet-500 hover:text-violet-400 focus:ring-slate-500"
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
