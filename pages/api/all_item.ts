// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "@/model/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const items = await prisma.item.findMany()
    return res.status(200).json(items)
}
