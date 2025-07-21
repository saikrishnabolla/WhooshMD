'use client'

import React from 'react';
import NextLink from 'next/link';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export const Link: React.FC<LinkProps> = ({ href, children, className = '', onClick, ...props }) => {
  return (
    <NextLink 
      href={href} 
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </NextLink>
  );
};