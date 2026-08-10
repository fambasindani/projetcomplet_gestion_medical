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
} = ({ children, className }) => (
  <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>{children}</div>
);

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={`px-6 py-4 border-b border-gray-200 font-semibold text-gray-800 ${className}`}>{children}</div>
);
CardHeader.displayName = "Card.Header";

const CardBody: React.FC<CardBodyProps> = ({ children, className }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);
CardBody.displayName = "Card.Body";

Card.Header = CardHeader;
Card.Body = CardBody;

export default Card;