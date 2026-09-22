import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HelpTooltipProps {
  content: string;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function HelpTooltip({ content, className, side = "top" }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center text-muted-foreground hover:text-sage transition-colors cursor-help",
              className
            )}
            aria-label="Help"
          >
            <HelpCircle className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-xs text-xs leading-relaxed"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Predefined help content for common features
export const HELP_CONTENT = {
  agents: "AI specialists trained for specific disasters. Each uses different satellite sensors and analysis methods.",
  layers: "7 processing steps that analyze satellite data using physics laws to ensure accurate results.",
  manifold: "A 128-dimensional representation of all physical properties detected from satellite imagery.",
  firewall: "Checks that results follow physics laws to prevent AI hallucinations. Green = trusted results.",
  trace: "Step-by-step breakdown of how the AI analyzed your question.",
  confidence: "How certain the AI is about its answer. Higher is better (aim for 80%+).",
  latency: "How long it took to analyze the satellite imagery (in milliseconds).",
  sarMode: "SAR = Synthetic Aperture Radar. Can see through clouds and darkness. Switch between Intensity (grayscale) and Pauli RGB (color-coded).",
  optical: "Regular satellite photos using visible light, like a camera.",
  dem: "Digital Elevation Model shows terrain height and slopes.",
  swipe: "Compare before/after satellite images by dragging the slider.",
  ndma: "National Disaster Management Authority protocols for emergency response.",
  geojson: "Geographic data format that can be opened in Google Earth or GIS software.",
};
