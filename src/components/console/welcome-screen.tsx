import { motion } from "framer-motion";
import { Satellite, MapPin, MessageSquare, BarChart3, Shield, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-background to-sage/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl text-center space-y-8"
      >
        {/* Logo & Title */}
        <div className="space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage/10 mb-4"
          >
            <Satellite className="size-10 text-sage" />
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            PARAM-BRAHMAND
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            AI-Powered Satellite Analysis for Disaster Management
          </p>
          
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-sage/40 text-sage">
              🇮🇳 ISRO Technology
            </Badge>
            <Badge variant="outline" className="border-sage/40 text-sage">
              Zero Hallucination
            </Badge>
            <Badge variant="outline" className="border-sage/40 text-sage">
              Real Satellite Data
            </Badge>
          </div>
        </div>

        {/* Simple "How It Works" */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-lg p-4 text-left space-y-2"
          >
            <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
              <MapPin className="size-5 text-sage" />
            </div>
            <h3 className="font-semibold text-sm">1. Choose Location</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select from 8 real disaster sites across India or click any area on the map
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-lg p-4 text-left space-y-2"
          >
            <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
              <MessageSquare className="size-5 text-sage" />
            </div>
            <h3 className="font-semibold text-sm">2. Ask Question</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Type in plain English like "Is there flooding?" or "How bad is the damage?"
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-lg p-4 text-left space-y-2"
          >
            <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
              <BarChart3 className="size-5 text-sage" />
            </div>
            <h3 className="font-semibold text-sm">3. Get Results</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Receive instant analysis with maps, charts, and actionable emergency protocols
            </p>
          </motion.div>
        </div>

        {/* Quick Features */}
        <div className="bg-card/50 border border-border rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="font-semibold mb-4 flex items-center justify-center gap-2">
            <Shield className="size-4 text-sage" />
            Why Trust PARAM-BRAHMAND?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-sm">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 text-sage">✓</div>
              <div>
                <strong>Physics-Verified:</strong> All results checked by physical laws
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5 text-sage">✓</div>
              <div>
                <strong>Real Data:</strong> Actual satellite imagery from ISRO sensors
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5 text-sage">✓</div>
              <div>
                <strong>Multi-Language:</strong> Support for 8 Indian languages
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5 text-sage">✓</div>
              <div>
                <strong>Fast Analysis:</strong> Results in under 3 seconds
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-4"
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-sage text-background hover:bg-sage/90 text-lg px-8 py-6 gap-2 shadow-lg shadow-sage/20"
          >
            <Sparkles className="size-5" />
            Start Analyzing
            <ArrowRight className="size-5" />
          </Button>
          
          <p className="mt-3 text-xs text-muted-foreground">
            No login required • Try sample missions • Learn as you go
          </p>
        </motion.div>

        {/* Sample Questions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="pt-4 border-t border-border"
        >
          <p className="text-xs text-muted-foreground mb-3">Try asking questions like:</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              "Is there flooding in this area?",
              "How much forest was lost?",
              "Where are the fire hotspots?",
              "What's the terrain elevation?",
            ].map((question) => (
              <span
                key={question}
                className="inline-block px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground border border-border"
              >
                "{question}"
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
