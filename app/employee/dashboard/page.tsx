import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Announcement from "@/models/Announcement";
import Holiday from "@/models/Holiday";
import EmployeeProfile from "@/models/EmployeeProfile";
import { EmployeeDashboardClient } from "@/components/employee-dashboard-client";
import { redirect } from "next/navigation";
import { isAfter, startOfToday } from "date-fns";

export default async function EmployeeDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  await connectToDatabase();

  const profileDoc = await EmployeeProfile.findOne({ userId: session.user.id }).lean();
  
  if (!profileDoc || (profileDoc as any).status !== 'verified') {
    redirect("/employee/onboarding");
  }

  const [announcements, holidays] = await Promise.all([
    Announcement.find({}).sort({ createdAt: -1 }).limit(3).lean(),
    Holiday.find({ date: { $gte: startOfToday() } }).sort({ date: 1 }).limit(2).lean(),
  ]);

  const data = {
    session: JSON.parse(JSON.stringify(session)),
    announcements: JSON.parse(JSON.stringify(announcements)),
    holidays: JSON.parse(JSON.stringify(holidays)),
    pay: profileDoc ? JSON.parse(JSON.stringify(profileDoc)) : { baseSalary: 0 }
  };

  return <EmployeeDashboardClient initialData={data as any} />;
}
