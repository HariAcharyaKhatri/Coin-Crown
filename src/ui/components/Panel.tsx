import React from 'react';
import styles from './Panel.module.css';

export interface PanelProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  children,
  headerAction,
  className = '',
}) => {
  return (
    <div className={`${styles.panel} ${className}`}>
      {(title || headerAction) && (
        <div className={styles.header}>
          <div>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {headerAction && <div className={styles.action}>{headerAction}</div>}
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
};
