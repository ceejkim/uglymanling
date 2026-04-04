import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="placeholder-shell">
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <SignIn />
      </div>
    </main>
  );
}
