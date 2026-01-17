import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Image Placeholder */}
          <div className="w-48 h-48 mx-auto mb-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-full flex items-center justify-center border border-border/50">
            <Heart className="w-20 h-20 text-primary/60" />
          </div>

          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Ready to discover each other?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Free sign-up. No judgment. Just connection.
          </p>

          <Button size="lg" className="text-lg px-10 py-6" asChild>
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
