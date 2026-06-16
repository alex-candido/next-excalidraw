import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function LandingHomeFeaturesGrid() {
  return (
    <div className="landing-home-features-grid w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-powered generation</CardTitle>
          <CardDescription>Describe your idea and get a full presentation instantly.</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Excalidraw canvas</CardTitle>
          <CardDescription>Edit every slide on an expressive, freeform canvas.</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Multi-language support</CardTitle>
          <CardDescription>Generate presentations in your language of choice.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
