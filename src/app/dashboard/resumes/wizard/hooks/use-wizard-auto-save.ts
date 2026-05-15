"use client";

import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { UseFormWatch, FieldValues } from "react-hook-form";
import { apiNext } from "~/lib/api-next";
import { wizardKeys } from "../lib/wizard-query";

type SaveState = "idle" | "saving" | "saved" | "error";

export function useWizardAutoSave<T extends FieldValues>(
  sessionId: string | null,
  stepNum: number,
  watch: UseFormWatch<T>,
) {
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastDataRef = useRef<T | undefined>(undefined);
  const saveStateRef = useRef<SaveState>("idle");

  const saveNow = useCallback(
    async (data: T, immediate = false): Promise<boolean> => {
      if (!sessionId) return false;
      saveStateRef.current = "saving";

      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const res = await apiNext.patch(
            `/wizard/${sessionId}/steps/${stepNum}`,
            data,
            immediate ? { timeout: 2000 } : undefined,
          );

          if (res.status >= 200 && res.status < 300) {
            saveStateRef.current = "saved";
            void queryClient.invalidateQueries({
              queryKey: wizardKeys.session(sessionId),
            });
            return true;
          }
        } catch (error) {
          if (isAxiosError(error)) {
            const status = error.response?.status;
            if (!status || ![429, 500, 502, 503, 504].includes(status)) {
              saveStateRef.current = "error";
              return false;
            }
          } else {
            saveStateRef.current = "error";
            return false;
          }
        }

        await new Promise((resolve) => {
          setTimeout(resolve, 200 * (attempt + 1));
        });
      }

      saveStateRef.current = "error";
      return false;
    },
    [sessionId, stepNum, queryClient],
  );

  useEffect(() => {
    if (!sessionId) return;

    const subscription = watch((data) => {
      lastDataRef.current = data as T;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (lastDataRef.current) {
          void saveNow(lastDataRef.current);
        }
      }, 500);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timerRef.current);
      if (lastDataRef.current) {
        void saveNow(lastDataRef.current, true);
      }
    };
  }, [saveNow, sessionId, watch]);

  return { saveState: saveStateRef.current };
}
