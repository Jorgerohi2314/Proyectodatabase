import { db } from '@/lib/db'
import type { Prisma } from '@prisma/client'

let counter = 0
const unique = (prefix: string) => `${prefix}-${++counter}`

export function userProfileData(
  overrides: Partial<Prisma.UserProfileCreateInput> = {}
): Prisma.UserProfileCreateInput {
  return {
    nombre: unique('Nombre'),
    apellidos: 'García López',
    source: 'PROPIO',
    fechaNacimiento: new Date('1990-05-15'),
    nacionalidad: 'Española',
    documentoIdentidad: `${Math.floor(10000000 + Math.random() * 89999999)}X`,
    numeroSeguridadSocial: `28${Math.floor(100000000 + Math.random() * 899999999)}`,
    sexo: Math.random() > 0.5 ? 'HOMBRE' : 'MUJER',
    direccion: 'Calle Falsa 123',
    localidad: 'Madrid',
    codigoPostal: '28001',
    telefono1: '600123456',
    email: `${unique('test')}@example.com`,
    carnetConducir: 'SI',
    vehiculoPropio: 'NO',
    tieneDiscapacidad: 'NO',
    insertado: 'NO',
    ...overrides,
  }
}

export async function createUserProfile(
  overrides: Partial<Prisma.UserProfileCreateInput> = {}
) {
  return db.userProfile.create({ data: userProfileData(overrides) })
}

export async function createUserWithFullData() {
  return db.userProfile.create({
    data: userProfileData({
      socioEconomicData: {
        create: {
          composicionFamiliar: 'Padre, madre y dos hermanos',
          situacionEconomica: 'Sin ingresos propios',
          otrasCircunstancias: 'Convive con familia',
        },
      },
      educationData: {
        create: {
          formacionAcademica: 'ESO',
          anioFinalizacion: 2008,
          experienciaLaboralPrevia: 'Camarero durante 2 años',
        },
      },
      complementaryCourses: {
        create: [
          {
            nombreCurso: 'Atención al cliente',
            duracionHoras: 40,
            entidad: 'Fundación Formación',
            fechaRealizacion: new Date('2024-03-10'),
          },
          {
            nombreCurso: 'Ofimática básica',
            duracionHoras: 60,
            entidad: 'Ayuntamiento',
            fechaRealizacion: new Date('2023-11-05'),
          },
        ],
      },
      incomeMembers: {
        create: [
          { numero: 1, tipo: 'Padre', cantidad: 1400.5 },
          { numero: 2, tipo: 'Madre', cantidad: 950 },
        ],
      },
      diaryEntries: {
        create: [
          {
            content: 'Primera entrevista realizada, buen perfil.',
            date: new Date('2025-01-15'),
            horas: 2,
          },
          {
            content: 'Derivado a curso de inserción laboral.',
            date: new Date('2025-02-20'),
            horas: 3,
          },
        ],
      },
    }),
    include: {
      socioEconomicData: true,
      educationData: true,
      complementaryCourses: true,
      incomeMembers: true,
      diaryEntries: true,
    },
  })
}

const nombres = ['Ana', 'Luis', 'María', 'Carlos', 'Lucía', 'Javier', 'Sofía', 'Miguel', 'Elena', 'Diego']
const apellidos = ['Pérez', 'Rodríguez', 'Fernández', 'Sánchez', 'Martín', 'Gómez']
const localidades = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza']

export async function seedUsers(count = 10) {
  const users: Awaited<ReturnType<typeof createUserProfile>>[] = []
  for (let i = 0; i < count; i++) {
    users.push(
      await createUserProfile({
        nombre: nombres[i % nombres.length],
        apellidos: apellidos[i % apellidos.length],
        localidad: localidades[i % localidades.length],
        insertado: i % 2 === 0 ? 'SI' : 'NO',
      })
    )
  }
  return users
}

export async function cleanDatabase() {
  await db.diaryEntry.deleteMany()
  await db.incomeMember.deleteMany()
  await db.complementaryCourse.deleteMany()
  await db.socioEconomicData.deleteMany()
  await db.educationData.deleteMany()
  await db.userProfile.deleteMany()
}
