import { type DependencyList, useCallback, useEffect, useRef, useState } from "react";

/** Carga asíncrona con estado de carga y error. `reload` repite la petición. */
export function useAsync<T>(fn: (signal: AbortSignal) => Promise<T>, deps: DependencyList) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    fnRef
      .current(ctrl.signal)
      .then((d) => !ctrl.signal.aborted && setData(d))
      .catch((e) => !ctrl.signal.aborted && setError(e))
      .finally(() => !ctrl.signal.aborted && setLoading(false));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload, setData };
}

/** Ejecuta `fn` cada `ms` mientras `active` sea verdadero (y la pestaña esté visible). */
export function useInterval(fn: () => void, ms: number, active: boolean) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") fnRef.current();
    }, ms);
    return () => window.clearInterval(id);
  }, [ms, active]);
}

/** Acción con estado "ocupado" y error, para botones. */
export function useAction<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const run = useCallback(
    async (...args: A): Promise<R | undefined> => {
      setBusy(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (e) {
        setError(e);
        return undefined;
      } finally {
        setBusy(false);
      }
    },
    [fn],
  );
  return { run, busy, error, setError };
}
