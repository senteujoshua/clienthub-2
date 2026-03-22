import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfMonth } from "date-fns";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monthStart = startOfMonth(new Date());
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const [
    totalClients,
    individualClients,
    companyClients,
    totalDocuments,
    documentsThisMonth,
    expiringDocuments,
    recentUploads,
    recentClients,
  ] = await Promise.all([
    db.client.count(),
    db.client.count({ where: { type: "individual" } }),
    db.client.count({ where: { type: "company" } }),
    db.document.count(),
    db.document.count({ where: { createdAt: { gte: monthStart } } }),
    db.document.count({
      where: {
        expiryDate: {
          gte: new Date(),
          lte: thirtyDaysFromNow,
        },
      },
    }),
    db.document.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { client: { select: { id: true, name: true } } },
    }),
    db.client.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { documents: true } } },
    }),
  ]);

  return Response.json({
    totalClients,
    individualClients,
    companyClients,
    totalDocuments,
    documentsThisMonth,
    expiringDocuments,
    recentUploads,
    recentClients,
  });
}
