import { useEffect } from "react";
import { useViewStore } from "./store/view";
import { checkInventoryDone } from "./features/lookup/inventoryDone";
import { FirstInventory } from "./features/inventory/FirstInventory";
import { LookupScreen } from "./features/lookup/LookupScreen";

export default function App() {
  const view = useViewStore((s) => s.view);
  const setView = useViewStore((s) => s.setView);

  useEffect(() => {
    checkInventoryDone().then((done) =>
      setView(done ? "lookup" : "first-inventory"),
    );
  }, [setView]);

  if (view === null) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return view === "lookup" ? <LookupScreen /> : <FirstInventory />;
}
