import React, { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮文本或子元素 */
  children: ReactNode;
  /** 按钮变体（样式类型） */
  variant?: ButtonVariant;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /** 是否为加载状态 */
  isLoading?: boolean;
  /** 加载状态时的文本（默认显示"加载中..."） */
  loadingText?: string;
  /** 自定义样式 */
  style?: CSSProperties;
  /** 图标（可放在左侧） */
  icon?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  loadingText = '加载中...',
  style,
  icon,
  disabled,
  onClick,
  ...props
}) => {
  // 加载状态下禁用按钮
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`btn ${variant} ${size} ${isLoading ? 'loading' : ''} ${isDisabled ? 'disabled' : ''}`}
      style={style}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {/* 加载状态显示 spinner */}
      {isLoading && <span className="spinner" />}
      
      {/* 图标 */}
      {icon && !isLoading && <span className="icon">{icon}</span>}
      
      {/* 按钮文本（加载状态显示 loadingText） */}
      <span className="content">
        {isLoading ? loadingText : children}
      </span>
    </button>
  );
};

export default Button;