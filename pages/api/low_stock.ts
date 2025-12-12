import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/model/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const items = await prisma.item.findMany({
      where: {
        quantity: {
          lt: 7,   // less than 7
        },
      },
    });

    return res.status(200).json(items);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
