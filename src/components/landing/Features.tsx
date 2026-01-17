import { Sparkles, Library, Shield, Calendar } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Discovery",
    description: "Our AI learns your taste and surfaces scenarios you're likely to enjoy. No endless scrolling through things that don't interest you.",
  },
  {
    icon: Library,
    title: "500+ Scenarios",
    description: "From romantic to adventurous. Gentle to intense. Curated library covering the full spectrum of intimacy.",
  },
  {
    icon: Shield,
    title: "Absolute Privacy",
    description: "Your unmatched answers are never shown — not to your partner, not to anyone. What you explore stays yours.",
  },
  {
    icon: Calendar,
    title: "Date Night Mode",
    description: "Matched on something? Get suggestions for how to bring it to life tonight.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why couples love it
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex gap-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Variety Preview Placeholder */}
        <div className="max-w-4xl mx-auto">
          <div className="aspect-[21/9] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl flex items-center justify-center border border-border/50">
            <div className="text-center p-8">
              <div className="grid grid-cols-5 gap-3 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-primary/10" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                [Grid: Variety preview thumbnails]
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
