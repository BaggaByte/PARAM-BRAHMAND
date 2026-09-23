import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Users, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConsole } from "@/lib/store";
import { TechExplainer } from "./tech-explainer";
import { AgentCardsSimple } from "./agent-cards-simple";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function JuryHelperMenu() {
  const menuOpen = useConsole((s) => s.juryHelperOpen);
  const setMenuOpen = useConsole((s) => s.setJuryHelperOpen);
  const [showTechExplainer, setShowTechExplainer] = useState(false);
  const [showAgentCards, setShowAgentCards] = useState(false);

  return (
    <>
      {/* Modal Dialog */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-[8500] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl border border-purple-500/40 bg-background/95 backdrop-blur-md p-5 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                    <HelpCircle className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">For Jury & Judges</h3>
                    <p className="text-xs text-muted-foreground">Easy Explanations</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8"
                  onClick={() => setMenuOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* Menu Options */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => {
                    setShowTechExplainer(true);
                    setMenuOpen(false);
                  }}
                >
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    <Lightbulb className="size-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">Technology Explained</div>
                    <div className="text-xs text-muted-foreground">
                      Understand the tech in simple terms
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => {
                    setShowAgentCards(true);
                    setMenuOpen(false);
                  }}
                >
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                    <Users className="size-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">Meet AI Specialists</div>
                    <div className="text-xs text-muted-foreground">
                      See what each expert does
                    </div>
                  </div>
                </Button>
              </div>

              {/* Bottom Note */}
              <div className="mt-4 pt-3 border-t border-border text-xs text-center text-muted-foreground">
                Click anywhere to see detailed explanations
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tech Explainer Modal */}
      {showTechExplainer && <TechExplainer onClose={() => setShowTechExplainer(false)} />}

      {/* Agent Cards Sheet */}
      <Sheet open={showAgentCards} onOpenChange={setShowAgentCards}>
        <SheetContent 
          side="bottom" 
          className="max-h-[90vh] overflow-y-auto"
        >
          <SheetHeader className="mb-6">
            <SheetTitle>Meet Our 9 AI Specialists</SheetTitle>
          </SheetHeader>
          <AgentCardsSimple />
        </SheetContent>
      </Sheet>
    </>
  );
}
