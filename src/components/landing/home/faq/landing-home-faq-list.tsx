import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function LandingHomeFaqList() {
  return (
    <Accordion className="landing-home-faq-list w-full max-w-2xl">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is Next Excalidraw?</AccordionTrigger>
        <AccordionContent>
          A SaaS platform that transforms text prompts into visual presentations using Excalidraw-style diagrams powered by AI.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Do I need design skills?</AccordionTrigger>
        <AccordionContent>
          No. Just describe what you want to present and the AI handles the visual structure for you.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Can I edit the generated slides?</AccordionTrigger>
        <AccordionContent>
          Yes. Every slide is fully editable on the Excalidraw canvas after generation.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>Is there a free trial?</AccordionTrigger>
        <AccordionContent>
          Yes, 14 days free with no credit card required.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
