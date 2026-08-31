import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
