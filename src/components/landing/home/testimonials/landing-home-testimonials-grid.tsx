import { Card, CardHeader, CardDescription } from "@/components/ui/card";
import { Small } from "@/components/ui/typography";

export function LandingHomeTestimonialsGrid() {
  return (
    <div className="landing-home-testimonials-grid w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardDescription>"Next Excalidraw changed how we present ideas to stakeholders."</CardDescription>
          <Small>Ana — Educator</Small>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>"I went from whiteboard to presentation in under 5 minutes."</CardDescription>
          <Small>Rafael — Tech Lead</Small>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>"Our team finally has a consistent way to communicate strategy."</CardDescription>
          <Small>Carla — Product Manager</Small>
        </CardHeader>
      </Card>
    </div>
  );
}
