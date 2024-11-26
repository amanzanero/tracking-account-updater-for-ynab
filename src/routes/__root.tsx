import { DarkModeToggle } from "@/components/DarkModeToggle";
import { ThemeProvider } from "@/components/ThemeProvider";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider storageKey="vite-ui-theme">
      <div className="w-full flex justify-center">
        <div className="p-4 flex gap-2 justify-end items-center max-w-screen-md w-full">
          <Link to="/" className="[&.active]:font-bold">
            Home
          </Link>
          <Link to="/privacy-policy" className="[&.active]:font-bold">
            Privacy policy
          </Link>
          <DarkModeToggle />
        </div>
      </div>

      <hr />

      <div className="min-h-dvh h-full w-full flex justify-center pl-4 pt-4 pr-4 pb-10">
        <Outlet />
      </div>
    </ThemeProvider>
  ),
});
