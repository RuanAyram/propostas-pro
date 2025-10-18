"use client";

import React, { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";

interface Page {
  id: number;
  html: string;
}

export default function PdfPreviewDynamic({ html }: { html: string }) {
  const [pages, setPages] = useState<Page[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sanitizedHtml = DOMPurify.sanitize(html);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const wrapper = wrapperRef.current;
    wrapper.innerHTML = sanitizedHtml;

    const pageHeight = 1123 - 96; // Altura A4 menos margens
    const elements = Array.from(wrapper.children);
    const newPages: Page[] = [];

    let currentPage = document.createElement("div");
    let currentHeight = 0;

    elements.forEach((el) => {
      const elHeight = el.getBoundingClientRect().height;

      if (currentHeight + elHeight > pageHeight) {
        newPages.push({
          id: newPages.length + 1,
          html: currentPage.innerHTML,
        });
        currentPage = document.createElement("div");
        currentHeight = 0;
      }

      currentPage.appendChild(el.cloneNode(true));
      currentHeight += elHeight;
    });

    if (currentPage.innerHTML.trim()) {
      newPages.push({
        id: newPages.length + 1,
        html: currentPage.innerHTML,
      });
    }

    setPages(newPages);
  }, [sanitizedHtml]);

  // Atualiza dinamicamente se o conteúdo mudar de tamanho
  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new ResizeObserver(() => {
      // reprocessa as páginas
      const evt = new Event("resize-html");
      window.dispatchEvent(evt);
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-gray-100">
      {/* Container invisível apenas para medir */}
      <div
        ref={wrapperRef}
        className="absolute opacity-0 pointer-events-none w-[794px] p-12 leading-relaxed text-sm" id="contract-preview"
      />

      {/* Render das páginas */}
      {pages.map((page, idx) => (
        <div
          key={page.id}
          className="relative bg-white border shadow-lg w-[794px] h-[1123px] p-12 overflow-hidden print:shadow-none"
        >
          <div
            className="text-gray-800 text-sm leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: page.html }}
          />

          {/* Rodapé */}
          <div className="absolute bottom-6 left-0 w-full text-center text-xs text-gray-500">
            Contrato de Prestação de Serviços — Página {idx + 1} de {pages.length}
          </div>
        </div>
      ))}
    </div>
  );
}
