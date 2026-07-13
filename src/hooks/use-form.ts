import { zodResolver } from "@hookform/resolvers/zod";
import {
  FieldValues,
  Resolver,
  UseFormProps,
  useForm as useReactHookForm,
} from "react-hook-form";
import type { ZodType } from "zod";

interface UseFormOptions<TFieldValues extends FieldValues, TApiResult> {
  schema: ZodType<TFieldValues, TFieldValues>;
  mutationFn: (data: TFieldValues) => Promise<TApiResult>;
  onSuccess?: (data: TApiResult, formValues: TFieldValues) => void;
  onError?: (error: Error, formValues: TFieldValues) => void;
  defaultValues?: UseFormProps<TFieldValues>["defaultValues"];
  mode?: UseFormProps<TFieldValues>["mode"];
}

export function useForm<TFieldValues extends FieldValues, TApiResult>({
  schema,
  mutationFn,
  onSuccess,
  onError,
  defaultValues,
  mode = "onChange",
}: UseFormOptions<TFieldValues, TApiResult>) {
  const form = useReactHookForm<TFieldValues>({
    resolver: zodResolver(schema) as Resolver<TFieldValues>,
    defaultValues,
    mode,
  });

  const onSubmit = async (data: TFieldValues) => {
    form.clearErrors("root");

    try {
      const result = await mutationFn(data);
      onSuccess?.(result, data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      form.setError("root", { type: "manual", message: error.message });
      onError?.(error, data);
    }
  };

  return {
    ...form,
    form,
    handleSubmit: form.handleSubmit(onSubmit),
  };
}
