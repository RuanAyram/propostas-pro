import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, content, description } = await request.json()

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 })
    }

    const template = await prisma.template.create({
      data: {
        name,
        content,
        description: description || ""
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error creating template:", error)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: "Template with this name already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}
