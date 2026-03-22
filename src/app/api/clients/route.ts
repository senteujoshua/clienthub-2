import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { clientSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "10"))
  );
  const sortBy = (searchParams.get("sortBy") ?? "createdAt") as
    | "name"
    | "createdAt"
    | "email";
  const sortOrder = (searchParams.get("sortOrder") ?? "desc") as
    | "asc"
    | "desc";

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search, mode: "insensitive" as const } },
        {
          contactPerson: { contains: search, mode: "insensitive" as const },
        },
      ],
    }),
    ...(type && type !== "all" && { type: type as "individual" | "company" }),
  };

  const [clients, total] = await Promise.all([
    db.client.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: { select: { documents: true } },
      },
    }),
    db.client.count({ where }),
  ]);

  return Response.json({
    data: clients,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = clientSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const client = await db.client.create({
      data: {
        ...parsed.data,
        idNumber: parsed.data.idNumber ?? null,
        registrationNumber: parsed.data.registrationNumber ?? null,
        contactPerson: parsed.data.contactPerson ?? null,
        notes: parsed.data.notes ?? null,
      },
    });

    return Response.json(client, { status: 201 });
  } catch (error) {
    console.error("[CLIENT CREATE]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
