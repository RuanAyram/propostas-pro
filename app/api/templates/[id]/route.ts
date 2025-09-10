import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, content, description } = await request.json()
    const id = Number.parseInt(params.id)

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 })
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
      return NextResponse.json({ error: "Template with this name already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

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
