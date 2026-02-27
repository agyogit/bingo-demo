import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variantClasses = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm',
  ghost: 'hover:bg-gray-100 text-gray-600',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
