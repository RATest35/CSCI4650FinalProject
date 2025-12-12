import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/model/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { id, removeQuantity } = req.body;

    const item = await prisma.item.findUnique({
      where: { id: Number(id) },
    });

    if (!item)
      return res.status(404).json({ error: "Item not found" });

    if (removeQuantity > item.quantity)
      return res.status(400).json({ error: "Not enough stock" });

    const updated = await prisma.item.update({
      where: { id: item.id },
      data: {
        quantity: item.quantity - removeQuantity,
      },
    });

    return res.status(200).json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
