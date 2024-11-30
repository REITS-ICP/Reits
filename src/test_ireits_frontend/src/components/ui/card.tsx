    // src/components/ui/card.tsx
    import React from 'react';

    interface CardProps {
      children: React.ReactNode;
    }

    const Card: React.FC<CardProps> = ({ children }) => (
      <div className="border rounded shadow p-4">
        {children}
      </div>
    );

    const CardHeader: React.FC<CardProps> = ({ children }) => (
      <div className="mb-2">
        {children}
      </div>
    );

    const CardTitle: React.FC<CardProps> = ({ children }) => (
      <h3 className="text-lg font-bold">
        {children}
      </h3>
    );

    const CardDescription: React.FC<CardProps> = ({ children }) => (
      <p className="text-sm text-gray-600">
        {children}
      </p>
    );

    const CardContent: React.FC<CardProps> = ({ children }) => (
      <div className="mb-4">
        {children}
      </div>
    );

    const CardFooter: React.FC<CardProps> = ({ children }) => (
      <div className="flex justify-end">
        {children}
      </div>
    );

    export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };