"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { apiClient } from "~/lib/api-client";
import {
  createWizardSession,
  fetchWizardSession,
  wizardKeys,
} from "~/lib/wizard-query";

function getErrorMessage(e: unknown): string {
  if (isAxiosError(e)) {
    const body = e.response?.data as { error?: string } | undefined;
    return body?.error ?? e.message;
  }
  return e instanceof Error ? e.message : "Something went wrong";
}

interface WizardContextValue {
  sessionId: string | null;
  currentStep: number;
  furthestStep: number;
  stepData: Record<string, unknown>;
  isLoading: boolean;
  loadError: string | null;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  refreshSession: () => Promise<void>;
  retryBootstrap: () => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used inside <WizardProvider>");
  return ctx;
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const didBootstrapRef = useRef(false);
  const hydratedSessionRef = useRef<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [furthestStep, setFurthestStep] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);

  const bootstrap = useMutation({
    mutationFn: createWizardSession,
    onSuccess: () => setLoadError(null),
    onError: (e) => {
      hydratedSessionRef.current = null;
      setSessionId(null);
      setLoadError(getErrorMessage(e));
    },
  });

  useEffect(() => {
    if (didBootstrapRef.current) return;
    didBootstrapRef.current = true;
    void (async () => {
      try {
        const created = await bootstrap.mutateAsync();
        setSessionId(created.sessionId);
      } catch {
        // error handled in onError
      }
    })();
  }, [bootstrap]);

  const sessionQuery = useQuery({
    queryKey: wizardKeys.session(sessionId ?? ""),
    queryFn: () => fetchWizardSession(sessionId!),
    enabled: Boolean(sessionId),
  });

  useEffect(() => {
    if (!sessionQuery.data) return;
    const cs = sessionQuery.data.currentStep;
    if (sessionId && hydratedSessionRef.current !== sessionId) {
      hydratedSessionRef.current = sessionId;
      setCurrentStep(cs);
    }
    setFurthestStep((prev) => Math.max(prev, cs));
  }, [sessionQuery.data, sessionId]);

  useEffect(() => {
    if (!sessionQuery.isError || !sessionQuery.error || !sessionId) return;
    const err = sessionQuery.error;
    if (isAxiosError(err) && err.response?.status === 404) {
      queryClient.removeQueries({ queryKey: wizardKeys.session(sessionId) });
      hydratedSessionRef.current = null;
      setSessionId(null);
      setCurrentStep(1);
      setFurthestStep(1);
      void (async () => {
        try {
          const created = await bootstrap.mutateAsync();
          setSessionId(created.sessionId);
        } catch {
          // onError handles
        }
      })();
      return;
    }
    setLoadError(getErrorMessage(err));
  }, [
    sessionQuery.isError,
    sessionQuery.error,
    sessionId,
    queryClient,
    bootstrap,
  ]);

  useEffect(() => {
    if (sessionQuery.isSuccess) {
      setLoadError(null);
    }
  }, [sessionQuery.isSuccess]);

  const patchStep8 = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => apiClient.patch(`/wizard/${id}/steps/8`, payload),
    onSuccess: async (_, { id }) => {
      await queryClient.invalidateQueries({
        queryKey: wizardKeys.session(id),
      });
    },
  });

  const refreshSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      const data = await queryClient.fetchQuery({
        queryKey: wizardKeys.session(sessionId),
        queryFn: () => fetchWizardSession(sessionId),
      });
      setLoadError(null);
      setFurthestStep((prev) => Math.max(prev, data.currentStep));
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 404) {
        queryClient.removeQueries({ queryKey: wizardKeys.session(sessionId) });
        hydratedSessionRef.current = null;
        setSessionId(null);
        setCurrentStep(1);
        setFurthestStep(1);
        try {
          const created = await bootstrap.mutateAsync();
          setSessionId(created.sessionId);
        } catch {
          // onError handles
        }
        return;
      }
      setLoadError(getErrorMessage(e));
    }
  }, [sessionId, queryClient, bootstrap]);

  const goToStep = useCallback(
    (step: number) => {
      const s = Math.min(Math.max(step, 1), 9);
      setCurrentStep(s);
      setFurthestStep((prev) => Math.max(prev, s));
      if (s === 9) {
        void refreshSession();
      }
    },
    [refreshSession],
  );

  const nextStep = useCallback(() => {
    const next = Math.min(currentStep + 1, 9);
    setCurrentStep(next);
    setFurthestStep((prev) => Math.max(prev, next));

    if (next === 9 && sessionId) {
      const data = sessionQuery.data;
      const step8Payload =
        (data?.stepData?.[8] as Record<string, unknown> | undefined) ?? {};
      void patchStep8.mutateAsync({ id: sessionId, payload: step8Payload });
      void refreshSession();
    }
  }, [currentStep, sessionId, sessionQuery.data, patchStep8, refreshSession]);

  const prevStep = useCallback(
    () => setCurrentStep((s) => Math.max(s - 1, 1)),
    [],
  );

  const retryBootstrap = useCallback(() => {
    setLoadError(null);
    if (sessionId) {
      queryClient.removeQueries({ queryKey: wizardKeys.session(sessionId) });
      hydratedSessionRef.current = null;
      setSessionId(null);
    }
    bootstrap.reset();
    void (async () => {
      try {
        const created = await bootstrap.mutateAsync();
        setSessionId(created.sessionId);
      } catch {
        // onError handles
      }
    })();
  }, [sessionId, queryClient, bootstrap]);

  const stepData = sessionQuery.data?.stepData ?? {};
  const isLoading =
    bootstrap.isPending ||
    (Boolean(sessionId) && sessionQuery.isPending && !sessionQuery.data);

  return (
    <WizardContext.Provider
      value={{
        sessionId,
        currentStep,
        furthestStep,
        stepData,
        isLoading,
        loadError,
        goToStep,
        nextStep,
        prevStep,
        refreshSession,
        retryBootstrap,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}
