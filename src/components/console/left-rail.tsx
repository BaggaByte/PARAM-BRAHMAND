import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentRail } from "./agent-rail";
import { LayerStack } from "./layer-stack";
import { useConsole } from "@/lib/store";
import { Users, Layers } from "lucide-react";

export function LeftRail() {
  const leftRailTab = useConsole((s) => s.leftRailTab);
  const setLeftRailTab = useConsole((s) => s.setLeftRailTab);

  return (
    <Tabs
      value={leftRailTab}
      onValueChange={(v) => setLeftRailTab(v as "agents" | "layers")}
      className="flex h-full min-h-0 flex-col"
    >
      <div className="shrink-0 border-b border-border px-3 pt-3">
        <TabsList className="w-full">
          <TabsTrigger value="agents" className="flex-1 gap-1.5">
            <Users className="size-3.5" />
            <span>Agents</span>
          </TabsTrigger>
          <TabsTrigger value="layers" className="flex-1 gap-1.5">
            <Layers className="size-3.5" />
            <span>Layers</span>
          </TabsTrigger>
        </TabsList>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <TabsContent value="agents" className="mt-0 h-full">
          <AgentRail />
        </TabsContent>
        <TabsContent value="layers" className="mt-0 h-full">
          <LayerStack />
        </TabsContent>
      </div>
    </Tabs>
  );
}
