import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Controller, FormProvider, useFormContext } from "react-hook-form";
import type {
  Control,
  FieldPath,
  FieldValues,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import Input, { type InputProps } from "./Input";
import Select, { type SelectProps, type SelectOption } from "./Select";

export type FormProps<TFieldValues extends FieldValues> = Omit<
  ComponentPropsWithoutRef<"form">,
  "onSubmit"
> & {
  methods: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  children: ReactNode;
};

export function Form<TFieldValues extends FieldValues>({
  methods,
  onSubmit,
  children,
  className = "",
  ...props
}: FormProps<TFieldValues>) {
  return (
    <FormProvider {...methods}>
      <form
        className={className}
        onSubmit={methods.handleSubmit(onSubmit)}
        noValidate
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}

type ControlledFieldBaseProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  control?: Control<TFieldValues>;
};

export type FormInputProps<TFieldValues extends FieldValues> = Omit<
  InputProps,
  "name" | "value" | "onChange" | "onBlur" | "ref" | "error"
> &
  ControlledFieldBaseProps<TFieldValues>;

export function FormInput<TFieldValues extends FieldValues>({
  name,
  control,
  ...inputProps
}: FormInputProps<TFieldValues>) {
  const { control: contextControl } = useFormContext<TFieldValues>();
  const resolvedControl = control || contextControl;

  return (
    <Controller
      name={name}
      control={resolvedControl}
      render={({ field, fieldState }) => (
        <Input
          {...inputProps}
          {...field}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

export type FormSelectProps<TFieldValues extends FieldValues> = Omit<
  SelectProps,
  "name" | "value" | "onChange" | "onBlur" | "ref" | "error"
> &
  ControlledFieldBaseProps<TFieldValues> & {
    options?: SelectOption[];
  };

export function FormSelect<TFieldValues extends FieldValues>({
  name,
  control,
  options,
  ...selectProps
}: FormSelectProps<TFieldValues>) {
  const { control: contextControl } = useFormContext<TFieldValues>();
  const resolvedControl = control || contextControl;

  return (
    <Controller
      name={name}
      control={resolvedControl}
      render={({ field, fieldState }) => (
        <Select
          {...selectProps}
          {...field}
          options={options}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

export default Form;


