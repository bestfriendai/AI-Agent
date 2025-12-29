import { SignIn } from "@/components/auth/SignIn";

export default function Index() {
  return (
    <SignIn signUpUrl="/sign-up" homeUrl="/(protected)" />
  );
}
