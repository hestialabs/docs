import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  title,
  description,
  children,
  hover = true,
  className = '',
  onClick,
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${hover ? styles.hoverable : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {title && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
