import Link from "next/link";

export default function Unauthorized() {
  return (
    <div>
      <h2>401 - Unauthorized</h2>
      <p>Please log in to access this resource.</p>
      <Link href="/auth">Sign In</Link>
    </div>
  );
}
