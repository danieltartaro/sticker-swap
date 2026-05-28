import { useEffect } from "react";
import { useViewStore } from "./store/view";
import { computeInitialView } from "./lib/routing";
import { Welcome } from "./features/inventory/Welcome";
import { FirstInventory } from "./features/inventory/FirstInventory";
import { CountryBrowse } from "./features/country-browse/CountryBrowse";

export default function App() {
  const view = useViewStore((s) => s.view);
  const setView = useViewStore((s) => s.setView);

  useEffect(() => {
    computeInitialView().then(setView);
    // Defense-in-depth: ask the browser to mark our IndexedDB as "persistent"
    // so it won't be evicted under storage pressure. Installed PWAs on iOS 16.4+
    // and Android Chrome grant this automatically. No-op on browsers that
    // don't support the Storage API (older Safari). Fire-and-forget.
    navigator.storage?.persist?.();
  }, [setView]);

  if (view === null) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center">
        Loading…
      </div>
    );
  }

  switch (view) {
    case "welcome":
      return <Welcome />;
    case "first-inventory":
      return <FirstInventory />;
    case "country-browse":
      return <CountryBrowse />;
  }
}
