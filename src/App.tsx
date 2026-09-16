import { RouterProvider } from "react-router-dom";

import { router } from "./app/router";

export default function App() {
  return (
    <div>
      <RouterProvider router={router} />;
    </div>
  );
}
