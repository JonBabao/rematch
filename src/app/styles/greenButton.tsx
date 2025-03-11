import React from 'react';

interface ButtonProperties {
    children: React.ReactNode;
    onClick?: () => void;
    style?: React.CSSProperties;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean; 
}

const GreenButton: React.FC<ButtonProperties> = ({ children, onClick, style, type = 'button', disabled = false }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className="rematchGreen text-gray-200 font-bold rounded-lg py-4 px-6 flex items-center justify-center hover:bg-[#2d2d2d] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={style}
        >
            {children}
        </button>
    );
};

export default GreenButton;
