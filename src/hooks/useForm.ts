"use client";

import { useState, useCallback } from "react";

export type FieldErrors<T extends Record<string, string>> = Partial<
  Record<keyof T, string>
>;

export interface UseFormConfig<T extends Record<string, string>> {
  initialValues: T;
  validate?: (values: T) => FieldErrors<T>;
  onSubmit: (values: T) => Promise<void>;
}

export interface UseFormReturn<T extends Record<string, string>> {
  values: T;
  errors: FieldErrors<T>;
  setValue: (field: keyof T, value: string) => void;
  setValues: (values: Partial<T> | ((prev: T) => T)) => void;
  setError: (message: string) => void;
  setErrors: (errors: FieldErrors<T>) => void;
  handleChange: (
    field: keyof T
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
  error: string;
}

export function useForm<T extends Record<string, string>>(
  config: UseFormConfig<T>
): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(config.initialValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setValue = useCallback((field: keyof T, value: string) => {
    setValuesState((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const setValues = useCallback((payload: Partial<T> | ((prev: T) => T)) => {
    setValuesState((prev) =>
      typeof payload === "function" ? payload(prev) : { ...prev, ...payload }
    );
  }, []);

  const handleChange = useCallback(
    (field: keyof T) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(field, e.target.value);
      },
    [setValue]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");
      const fieldErrors = config.validate ? config.validate(values) : {};
      const firstError = Object.values(fieldErrors).find(
        (v): v is string => typeof v === "string" && v.length > 0
      );
      if (firstError) {
        setErrors(fieldErrors);
        setError(firstError);
        return;
      }
      setErrors({} as FieldErrors<T>);
      setLoading(true);
      try {
        await config.onSubmit(values);
      } catch {
        setError("Connection error.");
      } finally {
        setLoading(false);
      }
    },
    [values, config]
  );

  return {
    values,
    errors,
    setValue,
    setValues,
    setError,
    setErrors,
    handleChange,
    handleSubmit,
    loading,
    error,
  };
}
