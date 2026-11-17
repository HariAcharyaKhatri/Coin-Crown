import React, { useEffect } from 'react';
import styles from './Modal.module.css';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>{title}</h2>
          <Button variant="secondary" size="sm" onClick={onClose} aria-label="Close dialog">
            ✕
          </Button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
};
