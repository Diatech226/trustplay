"use client";

// migrated from Vite React route to Next.js app router
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { HelmetProvider } from "react-helmet-async";
import ThemeProvider from "@/components/ThemeProvider.jsx";
import { store, persistor } from "@/redux/store";

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <HelmetProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </HelmetProvider>
      </PersistGate>
    </Provider>
  );
}
