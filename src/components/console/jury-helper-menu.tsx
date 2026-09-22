import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Users, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TechExplainer } from "./tech-explainer";
import { AgentCardsSimple } from "./agent-cards-simple";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function JuryHelperMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTechExplainer, setShowTechExplainer] = useState(false);
  const [showAgentCards, setShowAgentCards] = useState(false);

  return (
    <>
      {/* Main Menu Button */}
      <AnimatePresence>
        {!menuOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[8500]"
          >
            <Button
              onClick={() => setMenuOpen(true)}
              className="size-14 rounded-full shadow-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-110 transition-all"
              title="Jury Helper Menu"
            >
              <HelpCircle className="size-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[8500]"
          >
            <div className="rounded-2xl border-2 border-purple-500/40 bg-background/95 backdrop-blur-md p-4 shadow-2xl min-w-[280px]">
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
                  size="icon-sm"
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
            </div>
          </motion.div>
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
