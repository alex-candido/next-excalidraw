import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function LandingHomePricingPlans() {
  return (
    <div className="landing-home-pricing-plans w-full grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Free</CardTitle>
          <CardDescription>14-day trial, no credit card required.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            <Link href="/auth/sign-up">Get started</Link>
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pro</CardTitle>
          <CardDescription>For teams and organizations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">
            <Link href="/auth/sign-up">Get started</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
