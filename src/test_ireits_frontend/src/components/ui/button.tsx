    // src/components/ui/button.tsx
    import React from 'react';

    interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
      variant?: 'default' | 'outline';
    }

    const Button: React.FC<ButtonProps> = ({ variant = 'default', children, ...props }) => {
      const className = variant === 'outline' ? 'border border-gray-300' : 'bg-blue-500 text-white';
      
      return (
        <button className={`px-4 py-2 rounded ${className}`} {...props}>
          {children}
        </button>
      );
    };

    export { Button };