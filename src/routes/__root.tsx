import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2 justify-end">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>
        <Link to="/privacy-policy" className="[&.active]:font-bold">
          Privacy policy
        </Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
