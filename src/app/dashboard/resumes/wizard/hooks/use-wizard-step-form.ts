"use client";

import { useEffect, useRef } from "react";
import { useForm, type DefaultValues, type FieldValues } from "react-hook-form";
import { useWizard } from "../_components/WizardContext";

export function useWizardStepForm<T extends FieldValues>(
  stepNum: number,
  emptyValues: DefaultValues<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolver: any,
) {
  const { stepData, formResetKey, sessionId } = useWizard();
  const saved = stepData[stepNum] as Partial<T> | undefined;
  const lastResetKey = useRef(formResetKey);

  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    resolver,
    defaultValues: (saved ?? emptyValues) as DefaultValues<T>,
    mode: "onChange",
  });

  useEffect(() => {
    if (lastResetKey.current === formResetKey) return;
    lastResetKey.current = formResetKey;
    const next = (stepData[stepNum] as Partial<T> | undefined) ?? emptyValues;
    form.reset(next as DefaultValues<T>);
  }, [formResetKey, stepData, stepNum, emptyValues, form]);

  return { form, sessionId };
}
