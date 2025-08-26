'use client';

import React from 'react';
import { ChevronLeft, List, Loader2, Map, RefreshCcw, Save, Trash } from 'lucide-react';

// A simple and type-safe utility function for concatenating classNames.
// It filters out any falsy values (false, null, undefined, '').
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Define the component props interface
interface ActionButtonProps {
  /** Button text content */
  title: React.ReactNode;
  /** Button HTML type */
  type?: 'button' | 'submit' | 'reset';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to show loading state */
  isLoading?: boolean;
  /** Whether to use secondary styling */
  isSecondary?: boolean;
  /** Whether to show back arrow (legacy support) */
  isBack?: boolean;
  /** Whether to show refresh icon */
  isRefresh?: boolean;
  /** Whether to show save icon */
  isSave?: boolean;
  /** Whether to show route icon */
  isRoute?: boolean;
  /** Whether to show map icon */
  isMap?: boolean;
  /** Whether to show delete icon */
  isDelete?: boolean;
  /** Whether to use destructive styling */
  isDestructive?: boolean;
  /** Click handler function */
  onClick?: () => void;
  /** Icon component to display before the title */
  icon?: React.ReactNode;
  /** Icon component to display after the title */
  iconEnd?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Button size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width button */
  fullWidth?: boolean;
  /** Additional props to pass to the button element */
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

// Size variants
const sizeVariants = {
  sm: 'py-2 px-3 text-sm min-w-[80px]',
  md: 'py-2 px-4 text-base min-w-[100px]',
  lg: 'py-3 px-6 text-lg min-w-[120px]',
} as const;

// Base button styles
const baseStyles = `
  rounded-xl font-semibold
  transform hover:scale-105 active:scale-95
  disabled:scale-100
  transition-all duration-300
  shadow-lg hover:shadow-xl
  flex items-center justify-center
  focus:outline-none focus:ring-2 focus:ring-offset-2
`;

// Primary button styles
const primaryStyles = `
  text-white
  bg-gradient-to-r from-[#ff5f33] to-[#ff5f33]
  hover:from-[#f0441d] hover:to-[#f0441d]
  disabled:from-[#f29779] disabled:to-[#f29779]
  disabled:cursor-not-allowed
  focus:ring-orange-500
`;

// Secondary button styles
const secondaryStyles = `
  text-gray-700
  bg-gradient-to-r from-[#eee] to-[#eee]
  hover:from-[#ddd] hover:to-[#ddd]
  disabled:opacity-50 disabled:cursor-not-allowed
  focus:ring-gray-400
`;

const destructiveStyles = `
  text-white
  bg-gradient-to-r from-[#ff222d] to-[#ff2232]
  hover:from-[#ff111d] hover:to-[#ff1122]
  disabled:from-[#f29779] disabled:to-[#f29779]
  disabled:cursor-not-allowed
  focus:ring-orange-500
`;

// --- Main Component Declaration ---
// Changed from a const arrow function to a standard function declaration.
// This allows us to attach compound components to it later without redeclaring.
function ActionButtonComponent({
  title,
  type = 'button',
  disabled = false,
  isLoading = false,
  isSecondary = false,
  isBack = false,
  isRefresh = false,
  isSave = false,
  isRoute = false,
  isMap = false,
  isDelete = false,
  isDestructive = false,
  onClick,
  icon,
  iconEnd,
  className,
  size = 'md',
  fullWidth = false,
  buttonProps,
}: ActionButtonProps) {
  const isDisabled = disabled || isLoading;

  const startIcon = React.useMemo(() => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (isBack) {
      return <ChevronLeft className="h-4 w-4" />;
    }
    if (isRefresh) {
      return <RefreshCcw className="h-4 w-4" />;
    }
    if (isSave) {
      return <Save className="h-4 w-4" />;
    }
    if (isRoute) {
      return <List className="h-4 w-4" />;
    }
    if (isMap) {
      return <Map className="h-4 w-4" />;
    }
    if (isDelete) {
      return <Trash className="h-4 w-4" />;
    }
    return icon;
  }, [isLoading, isBack, icon]);

  const buttonClassName = cn(
    baseStyles,
    sizeVariants[size],
    isSecondary ? secondaryStyles : (isDelete ? destructiveStyles : primaryStyles),
    fullWidth && 'w-full',
    className
  );

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={buttonClassName}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      {...buttonProps}
    >
      {startIcon && (
        // FIX: Use a ternary to ensure only valid types are passed to cn()
        <span className={cn('flex-shrink-0', title ? 'mr-2' : null)}>
          {startIcon}
        </span>
      )}

      {title && <span className="flex-1 text-center">{title}</span>}

      {iconEnd && (
        // FIX: Use a ternary here as well
        <span className={cn('flex-shrink-0', title ? 'ml-2' : null)}>
          {iconEnd}
        </span>
      )}
    </button>
  );
}

// --- Compound Components ---
// Now we attach properties to the existing ActionButtonComponent function
// instead of redeclaring a new variable.

const PrimaryButton = (props: Omit<ActionButtonProps, 'isSecondary'>) => (
  <ActionButtonComponent {...props} isSecondary={false} />
);

const SecondaryButton = (props: Omit<ActionButtonProps, 'isSecondary'>) => (
  <ActionButtonComponent {...props} isSecondary={true} />
);

const BackButton = (props: Omit<ActionButtonProps, 'isBack' | 'isSecondary'>) => (
  <ActionButtonComponent {...props} isBack={true} isSecondary={true} />
);

const RefreshButton = (props: Omit<ActionButtonProps, 'isRefresh'>) => (
  <ActionButtonComponent {...props} isRefresh={true} />
);
const SaveButton = (props: Omit<ActionButtonProps, 'isSave'>) => (
  <ActionButtonComponent {...props} isSave={true} />
);
const RouteButton = (props: Omit<ActionButtonProps, 'isRoute'>) => (
  <ActionButtonComponent {...props} isRoute={true} />
);
const MapButton = (props: Omit<ActionButtonProps, 'isMap'>) => (
  <ActionButtonComponent {...props} isMap={true} />
);
const DeleteButton = (props: Omit<ActionButtonProps, 'isDelete' | 'isDestructive'>) => (
  <ActionButtonComponent {...props} isDelete={true} isDestructive={true} />
);

const LoadingButton = (props: Omit<ActionButtonProps, 'isLoading' | 'disabled'>) => (
  <ActionButtonComponent {...props} isLoading={true} disabled={true} />
);

// --- Export ---
// Assign the compound components and export the final object.
export const ActionButton = Object.assign(ActionButtonComponent, {
  Primary: PrimaryButton,
  Secondary: SecondaryButton,
  Back: BackButton,
  Refresh: RefreshButton,
  Save: SaveButton,
  Route: RouteButton,
  Map: MapButton,
  Delete: DeleteButton,
  Loading: LoadingButton,
});

export default ActionButton;