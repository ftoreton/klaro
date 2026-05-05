'use client';

import Icon from './Icon';

interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  return (
    <div className="toast">
      <span className="check">
        <Icon name="check" size={14} strokeWidth={2.5} />
      </span>
      {message}
    </div>
  );
}
