"use client";

import { useEffect, useRef, useCallback } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type * as PdfjsModule from "pdfjs-dist";

type PdfjsLib = typeof PdfjsModule;
let pdfjsPromise: Promise<PdfjsLib> | null = null;

function loadPdfjs() {
  pdfjsPromise ??= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    return pdfjs;
  });
  return pdfjsPromise;
}

interface PdfCanvasRendererProps {
  pdfData: ArrayBuffer | Uint8Array | null;
  className?: string;
}

export function PdfCanvasRenderer({
  pdfData,
  className,
}: PdfCanvasRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const renderIdRef = useRef(0);

  const renderPages = useCallback(
    async (doc: PDFDocumentProxy, currentRenderId: number) => {
      const container = containerRef.current;
      if (!container) return;

      const dpr = window.devicePixelRatio || 1;
      const renderScale = dpr * 1.5;
      const numPages = doc.numPages;

      while (container.children.length > numPages) {
        container.removeChild(container.lastChild!);
      }
      while (container.children.length < numPages) {
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.style.display = "block";
        canvas.style.borderRadius = "4px";
        container.appendChild(canvas);
      }

      for (let i = 1; i <= numPages; i++) {
        if (renderIdRef.current !== currentRenderId) return;

        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: renderScale });

        const canvas = container.children[i - 1] as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.aspectRatio = `${viewport.width} / ${viewport.height}`;

        await page.render({
          canvasContext: ctx,
          canvas,
          viewport,
        }).promise;
      }
    },
    [],
  );

  useEffect(() => {
    if (!pdfData) return;

    const renderId = ++renderIdRef.current;
    let cancelled = false;

    void (async () => {
      try {
        const pdfjs = await loadPdfjs();

        if (cancelled || renderIdRef.current !== renderId) return;

        const prevDoc = pdfDocRef.current;
        pdfDocRef.current = null;

        const dataCopy =
          pdfData instanceof ArrayBuffer
            ? new Uint8Array(pdfData).slice()
            : pdfData.slice();

        const doc = await pdfjs.getDocument({ data: dataCopy }).promise;

        if (cancelled || renderIdRef.current !== renderId) {
          void doc.cleanup();
          return;
        }

        if (prevDoc) {
          void prevDoc.cleanup();
        }

        pdfDocRef.current = doc;
        await renderPages(doc, renderId);
      } catch (err) {
        if (!cancelled) {
          console.error("PDF render error:", err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfData, renderPages]);

  useEffect(() => {
    return () => {
      if (pdfDocRef.current) {
        void pdfDocRef.current.cleanup();
        pdfDocRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
    />
  );
}
