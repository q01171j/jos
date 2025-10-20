import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("incidents")
    .select("code,user_name,status,created_at,areas(name),technicians(full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo generar el reporte." }, { status: 500 });
  }

  const incidents =
    data?.map((incident) => ({
      code: incident.code,
      user: incident.user_name,
      area: incident.areas?.name ?? "-",
      status: incident.status,
      technician: incident.technicians?.full_name ?? "Sin asignar",
      created_at: incident.created_at
        ? new Intl.DateTimeFormat("es-PE", {
            dateStyle: "medium",
            timeStyle: "short"
          }).format(new Date(incident.created_at))
        : "-"
    })) ?? [];

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let cursorY = pageHeight - 72;

  const drawHeader = () => {
    page.drawText("Municipalidad Provincial de Huancayo", {
      x: 48,
      y: cursorY,
      size: 14,
      font: fontBold
    });
    cursorY -= 18;
    page.drawText("Reporte de incidencias", {
      x: 48,
      y: cursorY,
      size: 12,
      font
    });
    cursorY -= 30;
  };

  const drawTableHeader = () => {
    const headers = ["Codigo", "Usuario", "Area", "Estado", "Tecnico", "Fecha"];
    const columnX = [48, 120, 240, 360, 430, 510];

    headers.forEach((text, index) => {
      page.drawText(text, {
        x: columnX[index],
        y: cursorY,
        size: 10,
        font: fontBold
      });
    });
    cursorY -= 16;
    page.drawLine({
      start: { x: 48, y: cursorY },
      end: { x: pageWidth - 48, y: cursorY },
      thickness: 0.5
    });
    cursorY -= 12;
  };

  drawHeader();
  drawTableHeader();

  const columnX = [48, 120, 240, 360, 430, 510];

  incidents.forEach((incident, rowIndex) => {
    if (cursorY < 72) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      cursorY = pageHeight - 72;
      drawHeader();
      drawTableHeader();
    }

    const values = [
      incident.code,
      incident.user,
      incident.area,
      incident.status,
      incident.technician,
      incident.created_at
    ];

    values.forEach((value, index) => {
      page.drawText(value.length > 26 ? `${value.slice(0, 23)}...` : value, {
        x: columnX[index],
        y: cursorY,
        size: 9,
        font
      });
    });

    cursorY -= 14;

    if ((rowIndex + 1) % 25 === 0) {
      page.drawLine({
        start: { x: 48, y: cursorY + 4 },
        end: { x: pageWidth - 48, y: cursorY + 4 },
        thickness: 0.25
      });
    }
  });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="reporte-incidencias.pdf"`
    }
  });
}
