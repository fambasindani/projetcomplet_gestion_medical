import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
} = ({ children, className = '' }) => (
  <div className={`overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 ${className}`}>{children}</div>
);

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`border-b border-slate-200 px-6 py-4 font-semibold text-slate-800 ${className}`}>{children}</div>
);
CardHeader.displayName = "Card.Header";

const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);
CardBody.displayName = "Card.Body";

Card.Header = CardHeader;
Card.Body = CardBody;

export default Card;