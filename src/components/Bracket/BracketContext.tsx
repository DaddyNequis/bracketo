import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useStore } from 'zustand';
import { createBracketStore, type BracketStore, type BracketStoreInstance } from '../../store/bracketStore';

interface BracketContextValue {
  store: BracketStoreInstance;
  containerRef: RefObject<HTMLDivElement | null>;
  readOnly: boolean;
  setReadOnly: Dispatch<SetStateAction<boolean>>;
}

const BracketContext = createContext<BracketContextValue | null>(null);

interface BracketProviderProps {
  children: ReactNode;
  defaultReadOnly?: boolean;
}

export function BracketProvider({ children, defaultReadOnly = true }: BracketProviderProps) {
  const storeRef = useRef<BracketStoreInstance | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [readOnly, setReadOnly] = useState(defaultReadOnly);

  if (!storeRef.current) {
    storeRef.current = createBracketStore();
  }

  return (
    <BracketContext.Provider value={{ store: storeRef.current, containerRef, readOnly, setReadOnly }}>
      {children}
    </BracketContext.Provider>
  );
}

function useBracketContext(): BracketContextValue {
  const ctx = useContext(BracketContext);
  if (!ctx) throw new Error('Must be used inside <BracketProvider>');
  return ctx;
}

export function useBracketStore<T>(selector: (state: BracketStore) => T): T {
  const { store } = useBracketContext();
  return useStore(store, selector);
}

export function useBracketStoreInstance(): BracketStoreInstance {
  return useBracketContext().store;
}

export function useContainerRef(): RefObject<HTMLDivElement | null> {
  return useBracketContext().containerRef;
}

export function useReadOnly(): [boolean, Dispatch<SetStateAction<boolean>>] {
  const { readOnly, setReadOnly } = useBracketContext();
  return [readOnly, setReadOnly];
}
