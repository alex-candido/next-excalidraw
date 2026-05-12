declare module "*.mdx" {
  import type { ComponentPropsWithoutRef } from "react";

  export default function MDXContent(
    props: ComponentPropsWithoutRef<"div">
  ): JSX.Element;
}
