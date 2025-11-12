import { createRoot } from "react-dom/client";
import "./index.css";
import AppWrapper from "./AppWrapper.js";
import { AuthProvider } from "./contexts/AuthContext.js";
import { GroupProvider } from "./contexts/GroupContext";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <GroupProvider>
      <AppWrapper />
    </GroupProvider>
  </AuthProvider>,
);
