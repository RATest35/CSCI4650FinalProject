import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/model/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { id, quantity } = req.body;

    const item = await prisma.item.findUnique({
      where: { id: Number(id) },
    });

    if (!item)
      return res.status(404).json({ error: "Item not found" });

    if (quantity <= 0)
      return res.status(400).json({ error: "Quantity must be positive" });

    if (quantity > item.quantity)
      return res.status(400).json({ error: "Not enough stock" });

    return res.status(200).json({
      id: item.id,
      name: item.name,
      oldQuantity: item.quantity,
      removeQuantity: quantity,
      newQuantity: item.quantity - quantity,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
