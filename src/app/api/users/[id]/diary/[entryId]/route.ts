import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateDiaryEntrySchema = z.object({
  content: z.string().min(1, 'El contenido de la entrada no puede estar vacío.'),
  date: z.string().optional().transform(val => val ? new Date(val) : new Date()),
  horas: z.number().min(0, 'Las horas no pueden ser negativas.').max(24, 'Las horas no pueden superar 24.').nullable().optional(),
});

/**
 * PUT /api/users/[id]/diary/[entryId]
 * Actualiza una entrada concreta del diario de un usuario.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const { id: userId, entryId } = await params;
    const body = await request.json();

    const validation = updateDiaryEntrySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validación fallida', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await db.diaryEntry.findFirst({
      where: { id: entryId, userProfileId: userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Entrada del diario no encontrada.' },
        { status: 404 }
      );
    }

    const { content, date, horas } = validation.data;

    const updatedEntry = await db.diaryEntry.update({
      where: { id: entryId },
      data: {
        content,
        date,
        horas: horas ?? null,
      },
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error updating diary entry:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al actualizar la entrada del diario.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]/diary/[entryId]
 * Elimina una entrada concreta del diario de un usuario.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const { id: userId, entryId } = await params;

    const existing = await db.diaryEntry.findFirst({
      where: { id: entryId, userProfileId: userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Entrada del diario no encontrada.' },
        { status: 404 }
      );
    }

    await db.diaryEntry.delete({ where: { id: entryId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting diary entry:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al eliminar la entrada del diario.' },
      { status: 500 }
    );
  }
}
