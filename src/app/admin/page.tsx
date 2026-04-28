import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth-helpers";
import { SuperAdminDashboard } from "@/components/admin/super/super-admin-dashboard";
import { Button } from "@/components/ui/button";

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#111F35] border-b border-[#1E3A5F]">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Image src="/logo.svg" alt="CanchaPro" width={120} height={30} priority />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#6B7F94] bg-[#1A2D47] px-3 py-1 rounded-full">SUPER ADMIN</span>
            <Link href="/">
              <Button className="bg-[#CAFF00] text-[#0A1628] hover:bg-[#B8FF00] font-bold cursor-pointer text-sm">
                Landing
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default async function SuperAdminPage() {
  await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <Navbar />
      <div className="pt-16">
        <SuperAdminDashboard />
      </div>
    </div>
  );
}