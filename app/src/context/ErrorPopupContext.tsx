import { createContext, useCallback, useRef, useState, useContext, ReactNode } from "react";

interface ErrorPopupState {
  visible: boolean;
  title: string;
  message: string;
}

interface ErrorPopupContextValue {
  errorPopup: ErrorPopupState;
  showError: (title: string, message: string) => void;
  hideError: () => void;
  setOnClose: (callback: (() => void) | null) => void;
}

const ErrorPopupContext = createContext<ErrorPopupContextValue | undefined>(undefined);

export function ErrorPopupProvider({ children }: { children: ReactNode }) {
  const [errorPopup, setErrorPopup] = useState<ErrorPopupState>({
    visible: false,
    title: "",
    message: "",
  });
  const onCloseRef = useRef<(() => void) | null>(null);

  const showError = useCallback((title: string, message: string) => {
    setErrorPopup({ visible: true, title, message });
  }, []);

  const hideError = useCallback(() => {
    if (onCloseRef.current) {
      onCloseRef.current();
    }
    onCloseRef.current = null;
    setErrorPopup({ visible: false, title: "", message: "" });
  }, []);

  const setOnClose = useCallback((callback: (() => void) | null) => {
    onCloseRef.current = callback;
  }, []);

  return (
    <ErrorPopupContext.Provider
      value={{
        errorPopup,
        showError,
        hideError,
        setOnClose,
      }}
    >
      {children}
    </ErrorPopupContext.Provider>
  );
}

export function useErrorPopup() {
  const context = useContext(ErrorPopupContext);
  if (!context) {
    throw new Error("useErrorPopup must be used within ErrorPopupProvider");
  }
  return context;
}