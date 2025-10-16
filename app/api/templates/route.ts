import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  // Aplicar rate limiting
  const rateLimitResponse = rateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const templates = await prisma.template.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Aplicar rate limiting
  const rateLimitResponse = rateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { userId, name, content, description } = await request.json()

    if (!userId || !name || !content) {
      return NextResponse.json({ error: "userId, name and content are required" }, { status: 400 })
    }

    const template = await prisma.template.create({
      data: {
        userId,
        name,
        content,
        description: description || ""
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error creating template:", error)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: "Template with this name already exists for this user" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}
