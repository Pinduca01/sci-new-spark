
import React from 'react';
import { Input } from '@/components/ui/input';
import { validateInput, sanitizeText } from '@/utils/securityUtils';
import { cn } from '@/lib/utils';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validationType?: 'email' | 'phone' | 'text' | 'number' | 'date';
  maxLength?: number;
  onValidationChange?: (isValid: boolean) => void;
}

const SecureInput: React.FC<SecureInputProps> = ({
  validationType = 'text',
  maxLength = 255,
  onValidationChange,
  onChange,
  className,
  ...props
}) => {
  const [isValid, setIsValid] = React.useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Sanitize input
    if (validationType === 'text') {
      value = sanitizeText(value);
    }

    // Validate input
    let valid = true;
    switch (validationType) {
      case 'email':
        valid = validateInput.email(value);
        break;
      case 'phone':
        valid = validateInput.phone(value);
        break;
      case 'text':
        valid = validateInput.text(value, maxLength);
        break;
      case 'number':
        valid = validateInput.number(value);
        break;
      case 'date':
        valid = validateInput.date(value);
        break;
      default:
        valid = true;
    }

    setIsValid(valid);
    onValidationChange?.(valid);

    // Update the input value with sanitized content
    e.target.value = value;
    onChange?.(e);
  };

  return (
    <Input
      {...props}
      onChange={handleChange}
      maxLength={maxLength}
      className={cn(
        className,
        !isValid && "border-destructive focus-visible:ring-destructive"
      )}
    />
  );
};

export default SecureInput;
