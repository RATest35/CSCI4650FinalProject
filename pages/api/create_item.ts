import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/model/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, quantity, category, price } = req.body;

    const item = await prisma.item.create({
      data: {
        name,
        quantity: Number(quantity),
        category,
        price: Number(price),
      },
    });

    return res.status(200).json(item);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
