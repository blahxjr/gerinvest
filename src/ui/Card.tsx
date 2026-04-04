import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
};

export default function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg ${className}`}>
      {title && <h3 className="text-lg font-semibold text-sky-300 mb-3">{title}</h3>}
      {children}
    </div>
  );
}
