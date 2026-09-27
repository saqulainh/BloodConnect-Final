import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'default',
  shadow = 'md',
  hover = false,
  border = true,
  rounded = 'xl',
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const roundeds = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  };

  const classes = [
    'bg-white',
    border ? 'border border-slate-200' : '',
    paddings[padding],
    shadows[shadow],
    roundeds[rounded],
    hover ? 'hover:shadow-lg transition-shadow duration-200' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
