"use client"

import { ReactNode, useRef, useEffect, useState } from "react"

interface PaginatedDocumentProps {
  children: ReactNode
  zoomLevel?: number
  className?: string
}

interface Page {
  content: ReactNode
  pageNumber: number
}

export function PaginatedDocument({ children, zoomLevel = 0.7, className = "" }: PaginatedDocumentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [pages, setPages] = useState<Page[]>([{ content: children, pageNumber: 1 }])

  // Constantes A4 em pixels (794x1123px)
  const A4_WIDTH = 794
  const A4_HEIGHT = 1123
  const HEADER_HEIGHT = 96 // 24px * 4 (h-24)
  const FOOTER_HEIGHT = 64 // 16px * 4 (h-16)
  const CONTENT_HEIGHT = A4_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT // ~963px

  return (
    <div className={`space-y-8 ${className}`}>
      {pages.map((page, index) => (
        <div
          key={index}
          className="bg-white shadow-2xl transition-transform duration-200 mx-auto"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "top center",
            width: A4_WIDTH,
            minHeight: A4_HEIGHT,
          }}
        >
          <div
            className="w-full bg-white relative"
            style={{
              minHeight: A4_HEIGHT,
            }}
          >
            {children}
          </div>
        </div>
      ))}
    </div>
  )
}
