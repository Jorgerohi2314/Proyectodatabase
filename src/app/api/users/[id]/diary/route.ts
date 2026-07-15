import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

/**
 * GET /api/users/[id]/diary
 * Obtiene todas las entradas del diario para un usuario.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = params;

    const diaryEntries = await db.diaryEntry.findMany({
      where: { userProfileId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(diaryEntries);
  } catch (error) {
    console.error('Error fetching diary entries:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener las entradas del diario.' },
      { status: 500 }
    );
  }
}

const createDiaryEntrySchema = z.object({
  content: z.string().min(1, 'El contenido de la entrada no puede estar vacío.'),
});

/**
 * POST /api/users/[id]/diary
 * Crea una nueva entrada en el diario para un usuario.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = params;
    const body = await request.json();

    const validation = createDiaryEntrySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validación fallida', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    const newEntry = await db.diaryEntry.create({
      data: {
        content,
        userProfileId: userId,
      },
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating diary entry:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al crear la entrada del diario.' },
      { status: 500 }
    );
  }
}
