import { Link as RouterLink, LinkProps } from 'react-router-dom';

import { cn } from '@/lib/utils';

export const Link = ({ className, children, ...props }: LinkProps) => {
  return (
    <RouterLink className={cn('text-primary hover:text-foreground', className)} {...props}>
      {children}
    </RouterLink>
  );
};