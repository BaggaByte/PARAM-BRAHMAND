import { motion } from "framer-motion";
import { 
  Droplets, 
  Flame, 
  Mountain, 
  Wind, 
  TreePine, 
  Factory, 
  Wheat, 
  Ship,
  Building2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AgentCardsSimple() {
  const agents = [
    {
      icon: <Droplets className="size-6" />,
      name: "Flood Expert",
      role: "Water Detection Specialist",
      simpleDescription: "Finds water and measures how deep floods are",
      whatItDoes: [
        "Detects water bodies",
        "Measures flood depth",
        "Tracks water spread",
      ],
      color: "from-blue-500 to-cyan-500",
      emoji: "💧",
    },
    {
      icon: <Flame className="size-6" />,
      name: "Fire Detective",
      role: "Heat & Smoke Specialist",
      simpleDescription: "Spots fires and smoke from space",
      whatItDoes: [
        "Detects active fires",
        "Tracks smoke spread",
        "Estimates fire size",
      ],
      color: "from-orange-500 to-red-500",
      emoji: "🔥",
    },
    {
      icon: <Mountain className="size-6" />,
      name: "Landslide Spotter",
      role: "Ground Movement Expert",
      simpleDescription: "Finds where land is sliding down hills",
      whatItDoes: [
        "Detects land movement",
        "Checks slope stability",
        "Warns of danger zones",
      ],
      color: "from-amber-600 to-orange-600",
      emoji: "⛰️",
    },
    {
      icon: <Wind className="size-6" />,
      name: "Storm Tracker",
      role: "Weather Pattern Analyst",
      simpleDescription: "Watches storms and predicts their path",
      whatItDoes: [
        "Tracks cyclones",
        "Measures wind speed",
        "Predicts storm path",
      ],
      color: "from-slate-500 to-gray-600",
      emoji: "🌪️",
    },
    {
      icon: <TreePine className="size-6" />,
      name: "Forest Guardian",
      role: "Vegetation Health Monitor",
      simpleDescription: "Checks if forests are healthy or damaged",
      whatItDoes: [
        "Monitors forest health",
        "Detects deforestation",
        "Tracks tree cover",
      ],
      color: "from-green-600 to-emerald-600",
      emoji: "🌲",
    },
    {
      icon: <Factory className="size-6" />,
      name: "Pollution Detector",
      role: "Air Quality Specialist",
      simpleDescription: "Finds pollution and measures air quality",
      whatItDoes: [
        "Detects air pollution",
        "Tracks smoke plumes",
        "Monitors emissions",
      ],
      color: "from-purple-500 to-indigo-500",
      emoji: "🏭",
    },
    {
      icon: <Wheat className="size-6" />,
      name: "Crop Doctor",
      role: "Agriculture Health Expert",
      simpleDescription: "Checks if crops are healthy or need help",
      whatItDoes: [
        "Monitors crop health",
        "Detects diseases",
        "Estimates yield",
      ],
      color: "from-yellow-500 to-green-500",
      emoji: "🌾",
    },
    {
      icon: <Ship className="size-6" />,
      name: "Water Body Analyst",
      role: "Lakes & Rivers Monitor",
      simpleDescription: "Watches rivers and lakes for changes",
      whatItDoes: [
        "Tracks water levels",
        "Monitors reservoirs",
        "Detects water quality",
      ],
      color: "from-teal-500 to-cyan-600",
      emoji: "🌊",
    },
    {
      icon: <Building2 className="size-6" />,
      name: "City Scanner",
      role: "Urban Infrastructure Watcher",
      simpleDescription: "Monitors buildings and roads for damage",
      whatItDoes: [
        "Detects building damage",
        "Monitors roads",
        "Tracks urban growth",
      ],
      color: "from-zinc-500 to-slate-600",
      emoji: "🏙️",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Meet Our 9 AI Specialists
        </h3>
        <p className="text-muted-foreground">
          Each expert analyzes one type of disaster - like having 9 specialists working together!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden rounded-xl border-2 border-border hover:border-sage transition-all duration-300 bg-card"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
            
            {/* Content */}
            <div className="relative p-5 space-y-3">
              {/* Icon & Emoji */}
              <div className="flex items-center justify-between">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${agent.color} text-white`}>
                  {agent.icon}
                </div>
                <span className="text-3xl" role="img" aria-label={agent.name}>
                  {agent.emoji}
                </span>
              </div>

              {/* Title */}
              <div>
                <h4 className="font-bold text-lg text-foreground mb-0.5">
                  {agent.name}
                </h4>
                <p className="text-xs text-sage font-medium uppercase tracking-wide">
                  {agent.role}
                </p>
              </div>

              {/* Simple Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {agent.simpleDescription}
              </p>

              {/* What It Does */}
              <div className="space-y-1.5 pt-2">
                <p className="text-xs font-semibold text-foreground/70">What it does:</p>
                {agent.whatItDoes.map((task, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="size-1.5 rounded-full bg-sage" />
                    <span>{task}</span>
                  </div>
                ))}
              </div>

              {/* Badge */}
              <Badge 
                variant="outline" 
                className="border-sage/40 text-sage text-xs"
              >
                AI Specialist #{index + 1}
              </Badge>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-sage/20 rounded-xl transition-all pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* Bottom Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-5 rounded-xl bg-sage/10 border-2 border-sage/30 text-center"
      >
        <p className="text-sm text-muted-foreground">
          <strong className="text-sage">All 9 specialists work together</strong> to analyze every 
          satellite image. Each one checks their specialty and reports back in{" "}
          <strong className="text-sage">under 3 seconds!</strong>
        </p>
      </motion.div>
    </div>
  );
}
