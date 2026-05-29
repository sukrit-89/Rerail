import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Shell } from "./components/Shell";
import { CampaignDetail } from "./pages/CampaignDetail";
import { ClaimPage } from "./pages/ClaimPage";
import { CreateCampaign } from "./pages/CreateCampaign";
import { Dashboard } from "./pages/Dashboard";
import { Metrics } from "./pages/Metrics";

const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/create", element: <CreateCampaign /> },
      { path: "/campaign/:id", element: <CampaignDetail /> },
      { path: "/claim/:token", element: <ClaimPage /> },
      { path: "/metrics", element: <Metrics /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
