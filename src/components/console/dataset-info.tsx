import * as Dialog from "@radix-ui/react-dialog";
import { Database, Image as ImageIcon, Radar, ThermometerSun, Map, Trees, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function DatasetInfo() {
  const [open, setOpen] = useState(false);
  const datasets = [
    {
      name: "Sentinel-2 L2A",
      type: "Optical Multispectral",
      resolution: "10m / 20m",
      icon: <ImageIcon className="size-5 text-green-500" />,
      desc: "High-resolution optical imagery for vegetation indices (NDVI) and water detection (MNDWI)."
    },
    {
      name: "Sentinel-1 GRD",
      type: "C-band SAR",
      resolution: "10m",
      icon: <Radar className="size-5 text-purple-500" />,
      desc: "Synthetic Aperture Radar (VV/VH polarizations). Penetrates cloud cover to detect standing water and structural changes."
    },
    {
      name: "Landsat 8/9",
      type: "Thermal & Optical",
      resolution: "30m (100m thermal)",
      icon: <ThermometerSun className="size-5 text-orange-500" />,
      desc: "Provides land surface temperature and broad multispectral data for urban heat and fire detection."
    },
    {
      name: "SRTM / Copernicus DEM",
      type: "Digital Elevation Model",
      resolution: "30m",
      icon: <Map className="size-5 text-amber-600" />,
      desc: "Topographic data used by the physics firewall to validate water flow, slope stability, and SAR shadow masking."
    },
    {
      name: "GEDI L2A/L3",
      type: "LiDAR Canopy Height",
      resolution: "25m footprint",
      icon: <Trees className="size-5 text-emerald-600" />,
      desc: "Spaceborne LiDAR data used for 3D canopy height modeling and biomass estimation in dense forests."
    }
  ];

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-full bg-background/50 backdrop-blur border-white/10 hover:bg-white/10 transition-colors">
          <Database className="size-4" />
          <span className="hidden sm:inline font-mono text-xs">Live Datasets</span>
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[2000] bg-background/80 backdrop-blur-md" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[2001] max-h-[min(40rem,90dvh)] w-[min(36rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-white/10 bg-background/90 p-6 text-foreground shadow-2xl glass-morphism">
          
          <div className="mb-4 pr-6">
            <Dialog.Title className="text-2xl font-display flex items-center gap-3 text-foreground font-bold">
              <Database className="size-6 text-primary" />
              Earth Intelligence Data Sources
            </Dialog.Title>
            <Dialog.Description className="text-muted-foreground text-sm mt-2 leading-relaxed">
              Param-Brahmand dynamically ingests and fuses multi-modal satellite data to build a 128-D physics manifold.
            </Dialog.Description>
          </div>

          <div className="grid gap-4 mt-6">
            {datasets.map((ds) => (
              <div key={ds.name} className="flex gap-4 p-4 rounded-2xl bg-card/40 border border-white/5 hover:border-primary/30 transition-colors">
                <div className="shrink-0 mt-1 p-2 rounded-full bg-secondary/50">
                  {ds.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    {ds.name}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">
                      {ds.resolution}
                    </span>
                  </h4>
                  <p className="text-xs text-primary/80 font-mono mt-1 mb-1">{ds.type}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{ds.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Dialog.Close className="absolute right-4 top-4 rounded-full p-2 bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
