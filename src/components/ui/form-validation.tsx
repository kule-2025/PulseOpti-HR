'use client';

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

export type ValidationRule<T = any> = {
  required?: boolean;
  message?: string;
  pattern?: RegExp;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  custom?: (value: T) => string | undefined;
};

export type FieldValidation<T = any> = {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
};

export type FormErrors<T extends Record<string, any>> = Partial<Record<keyof T, string>>;

export type UseFormOptions<T extends Record<string, any>> = {
  initialValues: T;
  validations?: Partial<Record<keyof T, ValidationRule<T[keyof T]>>>;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
};

export function useForm<T extends Record<string, any>>({
  initialValues,
  validations = {},
  onSubmit,
  validateOnChange = true,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [dirty, setDirty] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  // 验证单个字段
  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]): string | undefined => {
      const rules = validations[name];
      if (!rules) return undefined;

      // Required validation
      if (rules.required && (!value || value === '')) {
        return rules.message || `${String(name)} 是必填项`;
      }

      // Pattern validation
      if (rules.pattern && value && !rules.pattern.test(String(value))) {
        return rules.message || `${String(name)} 格式不正确`;
      }

      // Min/Max validation for numbers
      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          return rules.message || `${String(name)} 不能小于 ${rules.min}`;
        }
        if (rules.max !== undefined && value > rules.max) {
          return rules.message || `${String(name)} 不能大于 ${rules.max}`;
        }
      }

      // MinLength/MaxLength validation for strings
      if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          return rules.message || `${String(name)} 长度不能少于 ${rules.minLength}`;
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          return rules.message || `${String(name)} 长度不能超过 ${rules.maxLength}`;
        }
      }

      // Custom validation
      if (rules.custom) {
        return rules.custom(value);
      }

      return undefined;
    },
    [validations]
  );

  // 验证所有字段
  const validateAll = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;

    Object.keys(validations).forEach((name) => {
      const error = validateField(name as keyof T, values[name as keyof T]);
      if (error) {
        newErrors[name as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validations, validateField]);

  // 更新字段值
  const handleChange = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      setDirty((prev) => ({ ...prev, [name]: true }));

      if (validateOnChange && touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validateOnChange, touched, validateField]
  );

  // 字段失焦时验证
  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validateOnChange) {
        const error = validateField(name, values[name]);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validateOnChange, validateField, values]
  );

  // 重置表单
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setDirty({});
    setSubmitCount(0);
  }, [initialValues]);

  // 设置表单值
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // 提交表单
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setIsSubmitting(true);

      const isValid = validateAll();

      if (isValid) {
        try {
          await onSubmit(values);
          setSubmitCount((prev) => prev + 1);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }

      setIsSubmitting(false);
    },
    [values, validateAll, onSubmit]
  );

  // 检查表单是否有错误
  const hasErrors = Object.values(errors).some((error) => error !== undefined);
  const isValid = !hasErrors;

  return {
    values,
    errors,
    touched,
    dirty,
    isSubmitting,
    submitCount,
    isValid,
    hasErrors,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFormValues,
    setErrors,
    validateField,
    validateAll,
  };
}

// 表单字段组件
interface FormFieldProps<T = any> {
  name: string;
  label?: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  children: (props: {
    value: T;
    onChange: (value: T) => void;
    onBlur: () => void;
    error?: string;
    touched?: boolean;
    id: string;
  }) => React.ReactNode;
  className?: string;
}

export function FormField<T = any>({
  name,
  label,
  error,
  touched,
  required,
  children,
  className,
}: FormFieldProps<T>) {
  const fieldId = `field-${name}`;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children({
        value: undefined as T,
        onChange: () => {},
        onBlur: () => {},
        error: touched ? error : undefined,
        touched,
        id: fieldId,
      })}
      {error && touched && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

// 表单错误提示组件
interface FormErrorProps {
  error?: string;
  className?: string;
}

export function FormError({ error, className }: FormErrorProps) {
  if (!error) return null;

  return (
    <p className={cn('text-sm text-red-600 dark:text-red-400 mt-1', className)}>
      {error}
    </p>
  );
}

// 表单提交按钮组件
interface SubmitButtonProps {
  isSubmitting?: boolean;
  isValid?: boolean;
  label?: string;
  submittingLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function SubmitButton({
  isSubmitting = false,
  isValid = true,
  label = '提交',
  submittingLabel = '提交中...',
  className,
  disabled,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isSubmitting || !isValid}
      className={cn(
        'w-full px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200',
        'bg-blue-600 hover:bg-blue-700',
        'disabled:bg-gray-400 disabled:cursor-not-allowed',
        className
      )}
    >
      {isSubmitting ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {submittingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}

// 表单重置按钮组件
interface ResetButtonProps {
  onReset: () => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function ResetButton({
  onReset,
  label = '重置',
  className,
  disabled,
}: ResetButtonProps) {
  return (
    <button
      type="button"
      onClick={onReset}
      disabled={disabled}
      className={cn(
        'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg',
        'hover:bg-gray-50',
        'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
        'dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700',
        className
      )}
    >
      {label}
    </button>
  );
}
