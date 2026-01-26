'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

type FormState<T> = {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  submitting: boolean;
  isValid: boolean;
};

type ValidationRule<T> = {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  custom?: (value: any, values: T) => string | undefined;
};

type ValidationRules<T> = Partial<Record<keyof T, ValidationRule<T>>>;

type UseFormOptions<T> = {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit: (values: T) => Promise<void> | void;
  onChange?: (values: T) => void;
  validateOnChange?: boolean;
};

/**
 * 优化的表单处理 Hook
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
  onChange,
  validateOnChange = false,
}: UseFormOptions<T>) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    submitting: false,
    isValid: true,
  });

  const isSubmittingRef = useRef(false);
  const initialValuesRef = useRef(initialValues);

  // 更新 initial values 当它们变化时
  useEffect(() => {
    initialValuesRef.current = initialValues;
  }, [initialValues]);

  // 验证单个字段
  const validateField = useCallback(
    (name: keyof T, value: any, values: T): string | undefined => {
      const rules = validationRules[name];
      if (!rules) return undefined;

      // Required validation
      if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return '此字段为必填项';
      }

      // Pattern validation
      if (rules.pattern && value && !rules.pattern.test(value)) {
        return '格式不正确';
      }

      // Min/Max length validation
      if (rules.minLength && value && value.length < rules.minLength) {
        return `最少需要 ${rules.minLength} 个字符`;
      }

      if (rules.maxLength && value && value.length > rules.maxLength) {
        return `最多允许 ${rules.maxLength} 个字符`;
      }

      // Min/Max value validation
      if (rules.min !== undefined && value !== undefined && value < rules.min) {
        return `值不能小于 ${rules.min}`;
      }

      if (rules.max !== undefined && value !== undefined && value > rules.max) {
        return `值不能大于 ${rules.max}`;
      }

      // Custom validation
      if (rules.custom) {
        return rules.custom(value, values);
      }

      return undefined;
    },
    [validationRules]
  );

  // 验证整个表单
  const validateForm = useCallback(
    (values: T): Partial<Record<keyof T, string>> => {
      const errors: Partial<Record<keyof T, string>> = {};

      for (const key in validationRules) {
        const error = validateField(key, values[key], values);
        if (error) {
          errors[key] = error;
        }
      }

      return errors;
    },
    [validationRules, validateField]
  );

  // 处理字段变化
  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      setState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const newTouched = { ...prev.touched, [name]: true };

        let newErrors = { ...prev.errors };

        if (validateOnChange || prev.touched[name]) {
          const error = validateField(name, value, newValues);
          if (error) {
            newErrors[name] = error;
          } else {
            delete newErrors[name];
          }
        }

        const newErrorsObj = validateForm(newValues);
        const isValid = Object.keys(newErrorsObj).length === 0;

        onChange?.(newValues);

        return {
          values: newValues,
          touched: newTouched,
          errors: newErrors,
          submitting: false,
          isValid,
        };
      });
    },
    [validateField, validateForm, validateOnChange, onChange]
  );

  // 处理字段失焦
  const handleBlur = useCallback(
    (name: keyof T) => {
      setState((prev) => {
        const newTouched = { ...prev.touched, [name]: true };
        const error = validateField(name, prev.values[name], prev.values);

        const newErrors = { ...prev.errors };
        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }

        const isValid = Object.keys(newErrors).length === 0;

        return {
          ...prev,
          touched: newTouched,
          errors: newErrors,
          isValid,
        };
      });
    },
    [validateField]
  );

  // 处理表单提交
  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      if (event) {
        event.preventDefault();
      }

      if (isSubmittingRef.current) return;

      const errors = validateForm(state.values);
      const isValid = Object.keys(errors).length === 0;

      setState((prev) => ({
        ...prev,
        errors,
        isValid,
      }));

      if (!isValid) return;

      isSubmittingRef.current = true;
      setState((prev) => ({ ...prev, submitting: true }));

      try {
        await onSubmit(state.values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        isSubmittingRef.current = false;
        setState((prev) => ({ ...prev, submitting: false }));
      }
    },
    [state.values, validateForm, onSubmit]
  );

  // 重置表单
  const resetForm = useCallback(() => {
    setState({
      values: initialValuesRef.current,
      errors: {},
      touched: {},
      submitting: false,
      isValid: true,
    });
  }, []);

  // 设置字段值
  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setState((prev) => {
      const newValues = { ...prev.values, [name]: value };
      return { ...prev, values: newValues };
    });
  }, []);

  // 设置多个字段值
  const setValues = useCallback((values: Partial<T>) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, ...values },
    }));
  }, []);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    submitting: state.submitting,
    isValid: state.isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setValues,
  };
}

/**
 * 防抖输入 Hook - 适用于搜索框等需要防抖的场景
 */
export function useDebounceInput<T>(
  initialValue: T,
  delay: number = 300,
  onChange?: (value: T) => void
) {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      onChange?.(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, onChange]);

  return {
    value,
    debouncedValue,
    setValue,
  };
}

/**
 * 表单字段组件 Props
 */
export interface UseFormFieldProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  error?: string;
  touched?: boolean;
}

/**
 * 创建表单字段 Props
 */
export function useFormField<T extends Record<string, any>>(
  form: ReturnType<typeof useForm<T>>,
  name: keyof T
): UseFormFieldProps {
  return {
    name: String(name),
    value: form.values[name],
    onChange: (value: any) => form.handleChange(name, value),
    onBlur: () => form.handleBlur(name),
    error: form.errors[name],
    touched: form.touched[name],
  };
}
