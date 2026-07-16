import { zodResolver } from "@hookform/resolvers/zod";
import {
  FieldValues,
  Resolver,
  UseFormProps,
  useForm as useReactHookForm,
} from "react-hook-form";
import type { ZodType } from "zod";

// TOutput != TFieldValues quando o schema tem `.default()`/`.optional()` que
// divergem entrada (o que o form guarda) de saída (o que o resolver valida) —
// ex: presentationCreateSchema. Nos schemas de auth (sem default) os dois tipos
// coincidem, então TOutput cai no default e nada muda pra eles.
interface UseFormOptions<TFieldValues extends FieldValues, TApiResult, TOutput extends FieldValues = TFieldValues> {
  schema: ZodType<TOutput, TFieldValues>;
  mutationFn: (data: TOutput) => Promise<TApiResult>;
  onSuccess?: (data: TApiResult, formValues: TOutput) => void;
  onError?: (error: Error, formValues: TOutput) => void;
  defaultValues?: UseFormProps<TFieldValues>["defaultValues"];
  mode?: UseFormProps<TFieldValues>["mode"];
}

export function useForm<TFieldValues extends FieldValues, TApiResult, TOutput extends FieldValues = TFieldValues>({
  schema,
  mutationFn,
  onSuccess,
  onError,
  defaultValues,
  mode = "onChange",
}: UseFormOptions<TFieldValues, TApiResult, TOutput>) {
  const form = useReactHookForm<TFieldValues, unknown, TOutput>({
    resolver: zodResolver(schema) as Resolver<TFieldValues, unknown, TOutput>,
    defaultValues,
    mode,
  });

  const onSubmit = async (data: TOutput) => {
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
