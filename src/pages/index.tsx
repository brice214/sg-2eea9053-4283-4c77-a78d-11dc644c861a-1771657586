import { useEffect } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
    </div>
  );
}