'use client';

import React from 'react';
import { FaSync } from 'react-icons/fa';
import Button from './Button';

interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>;
  loading?: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh, loading = false }) => {
  const handleClick = async () => {
    await onRefresh();
  };

  return (
    <Button
      variant="secondary"
      onClick={handleClick}
      disabled={loading}
      icon={<FaSync className={loading ? 'animate-spin' : ''} />}
    >
      Actualiser
    </Button>
  );
};

export default RefreshButton;
