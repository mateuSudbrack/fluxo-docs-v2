import React from 'react';
import { Icons } from '../icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-16"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-card rounded-lg shadow-xl w-full max-w-2xl m-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-primary"
            aria-label="Close modal"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
