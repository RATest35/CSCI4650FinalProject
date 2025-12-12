import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/model/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { id } = req.body;

    await prisma.item.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}