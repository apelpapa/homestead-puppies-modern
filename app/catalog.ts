import { useEffect, useState } from "react";

import { apiRequest } from "./api";
import type {
  Parent,
  ParentsResponse,
  PuppiesResponse,
  Puppy,
} from "./types";

type ResourceState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
};

function useResource<TResponse, TData>(
  path: string,
  initialData: TData,
  select: (response: TResponse) => TData,
): ResourceState<TData> {
  const [state, setState] = useState<ResourceState<TData>>({
    data: initialData,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    apiRequest<TResponse>(path, { signal: controller.signal })
      .then((response) => {
        setState({ data: select(response), loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState((current) => ({
          ...current,
          loading: false,
          error: "The live catalog could not be loaded. Please try again shortly.",
        }));
      });

    return () => controller.abort();
  }, [path, select]);

  return state;
}

const selectPuppies = (response: PuppiesResponse) => response.puppies;
const selectParents = (response: ParentsResponse) => response.parents;

export function usePuppies() {
  return useResource<PuppiesResponse, Puppy[]>(
    "/puppies",
    [],
    selectPuppies,
  );
}

export function useParents() {
  return useResource<ParentsResponse, Parent[]>("/parents", [], selectParents);
}
