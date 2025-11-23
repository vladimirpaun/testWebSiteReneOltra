import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const supplements = await prisma.supplement.findMany()
        return NextResponse.json(supplements)
    } catch (error) {
        console.error('Error fetching supplements:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
