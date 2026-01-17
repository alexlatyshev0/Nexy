import { MessageSquare, Link2, Heart } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Answer fun questions",
    description: "Swipe through scenarios and mark what intrigues you. AI adapts to your responses and shows you more of what you might like.",
    placeholder: "[UI mockup: Scenario card with Yes/No/Maybe buttons]",
  },
  {
    icon: Link2,
    title: "Invite your partner",
    description: "Send a private link. They answer the same questions independently. No peeking.",
    placeholder: "[Phone screen: Send invite UI]",
  },
  {
    icon: Heart,
    title: "See only mutual matches",
    description: "If you both said yes — it's a match. If not, neither of you ever knows what the other said. Zero awkwardness.",
    placeholder: "[UI mockup: Match celebration screen]",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple. Safe. Eye-opening.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three easy steps to discover what you both really want
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              {/* Step Number */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg mb-6">
                {index + 1}
              </div>

              {/* Image Placeholder */}
              <div className="aspect-[4/5] mb-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl flex items-center justify-center border border-border/50">
                <div className="p-6 text-center">
                  <step.icon className="w-12 h-12 mx-auto mb-3 text-primary/60" />
                  <p className="text-xs text-muted-foreground">{step.placeholder}</p>
                </div>
              </div>

              {/* Content */}
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
