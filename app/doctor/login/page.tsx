import { Suspense } from "react";
import { DoctorAuth } from "@/components/doctor/doctor-auth";

export default function DoctorLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DoctorAuth mode="login" />
    </Suspense>
  );
}
