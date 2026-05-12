import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <h2>404 - Not Found</h2>
        <Link href="/">Return Home</Link>
      </body>
    </html>
  );
}
