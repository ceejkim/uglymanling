import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="placeholder-shell">
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <SignUp />
      </div>
    </main>
  );
}
