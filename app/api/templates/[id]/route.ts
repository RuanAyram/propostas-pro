import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // Aplicar rate limiting
  const rateLimitResponse = rateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { userId, name, content, description } = await request.json()
    const id = Number.parseInt(params.id)

    if (!userId || !name || !content) {
      return NextResponse.json({ error: "userId, name and content are required" }, { status: 400 })
    }

    // Verificar se o template pertence ao usuário
    const existingTemplate = await prisma.template.findUnique({
      where: { id }
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    if (existingTemplate.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const template = await prisma.template.update({
      where: { id },
      data: {
        name,
        content,
        description: description || ""
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error updating template:", error)
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: "Template with this name already exists for this user" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Aplicar rate limiting
  const rateLimitResponse = rateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const id = Number.parseInt(params.id)

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // Verificar se o template pertence ao usuário
    const existingTemplate = await prisma.template.findUnique({
      where: { id }
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    if (existingTemplate.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.template.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting template:", error)
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}
