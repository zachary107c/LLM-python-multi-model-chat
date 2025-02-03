import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import * as React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HelmetProvider } from "react-helmet-async";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { MainErrorFallback } from "@/components/errors/main";
import { Toaster } from "@/components/ui/toaster";
import { AuthLoader } from "@/lib/auth";
import { queryConfig } from "@/lib/react-query";
import HashLoader from "react-spinners/HashLoader";

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: queryConfig,
      })
  );

  return (
    <ThemeProvider>
      <React.Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center">
            <HashLoader size={200} />
          </div>
        }
      >
        <ErrorBoundary FallbackComponent={MainErrorFallback}>
          <HelmetProvider>
            <SidebarProvider>
              <TooltipProvider>
                <QueryClientProvider client={queryClient}>
                  {import.meta.env.DEV && <ReactQueryDevtools />}
                  <Toaster />
                  <AuthLoader
                    renderLoading={() => (
                      <div className="flex h-screen w-screen items-center justify-center">
                        <HashLoader size={200} />
                      </div>
                    )}
                  >
                    {children}
                  </AuthLoader>
                </QueryClientProvider>
              </TooltipProvider>
            </SidebarProvider>
          </HelmetProvider>
        </ErrorBoundary>
      </React.Suspense>
    </ThemeProvider>
  );
};
