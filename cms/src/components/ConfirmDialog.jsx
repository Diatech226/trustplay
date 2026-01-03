import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setState({
        title: options?.title || 'Confirmer',
        message: options?.message || 'Voulez-vous continuer ?',
        confirmText: options?.confirmText || 'Confirmer',
        cancelText: options?.cancelText || 'Annuler',
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(
    (result) => {
      if (state?.resolve) {
        state.resolve(result);
      }
      setState(null);
    },
    [state]
  );

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {state ? (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{state.title}</h3>
            <p>{state.message}</p>
            <div className="section-header" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="button secondary" onClick={() => handleClose(false)}>
                {state.cancelText}
              </button>
              <button className="button danger" onClick={() => handleClose(true)}>
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context;
};
