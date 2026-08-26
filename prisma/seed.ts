import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const nombres = ['Ana', 'Luis', 'María', 'Carlos', 'Lucía', 'Javier', 'Sofía', 'Miguel', 'Elena', 'Diego', 'Paula', 'Sergio']
const apellidos = ['Pérez', 'Rodríguez', 'Fernández', 'Sánchez', 'Martín', 'Gómez', 'Ruiz', 'Torres']
const localidades = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Bilbao']
const formaciones = ['ESO', 'BACHILLER', 'FPI_CICLO_GRADO_MEDIO', 'FPII_CICLO_GRADO_SUPERIOR', 'LICENCIADO_ING_SUPERIOR'] as const
const sectores = ['Hostelería', 'Comercio', 'Administración', 'Construcción', 'Tecnología']

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
  console.log('Limpiando base de datos...')
  await db.diaryEntry.deleteMany()
  await db.incomeMember.deleteMany()
  await db.complementaryCourse.deleteMany()
  await db.socioEconomicData.deleteMany()
  await db.educationData.deleteMany()
  await db.userProfile.deleteMany()

  console.log('Generando datos de prueba...')
  for (let i = 0; i < 20; i++) {
    await db.userProfile.create({
      data: {
        nombre: pick(nombres),
        apellidos: `${pick(apellidos)} ${pick(apellidos)}`,
        source: i % 3 === 0 ? 'DERIVADO' : 'PROPIO',
        fechaNacimiento: new Date(1980 + (i % 25), i % 12, 1 + (i % 28)),
        nacionalidad: 'Española',
        documentoIdentidad: `${10000000 + i * 137}X`,
        numeroSeguridadSocial: `28${100000000 + i * 977}`,
        sexo: i % 2 === 0 ? 'HOMBRE' : 'MUJER',
        direccion: `Calle Ejemplo ${i + 1}`,
        localidad: pick(localidades),
        codigoPostal: `280${10 + (i % 80)}`,
        telefono1: `600${String(100000 + i * 111).slice(0, 6)}`,
        email: `usuario${i + 1}@example.com`,
        carnetConducir: i % 2 === 0 ? 'SI' : 'NO',
        vehiculoPropio: i % 3 === 0 ? 'SI' : 'NO',
        tieneDiscapacidad: i % 5 === 0 ? 'SI' : 'NO',
        porcentajeDiscapacidad: i % 5 === 0 ? 33 : null,
        insertado: i % 4 === 0 ? 'SI' : 'NO',
        sector: i % 4 === 0 ? pick(sectores) : undefined,
        empresa: i % 4 === 0 ? `Empresa ${pick(sectores)} S.L.` : undefined,
        socioEconomicData:
          i % 2 === 0
            ? {
                create: {
                  composicionFamiliar: `${1 + (i % 5)} miembros`,
                  situacionEconomica: i % 3 === 0 ? 'Sin ingresos propios' : 'Ingresos familiares bajos',
                  otrasCircunstancias: 'Convive con familia',
                },
              }
            : undefined,
        educationData: {
          create: {
            formacionAcademica: pick(formaciones),
            anioFinalizacion: 2000 + (i % 24),
            experienciaLaboralPrevia: i % 2 === 0 ? 'Experiencia previa en hostelería' : 'Sin experiencia',
          },
        },
        complementaryCourses: {
          create: [
            {
              nombreCurso: pick(['Atención al cliente', 'Ofimática básica', 'Prevención de riesgos']),
              duracionHoras: pick([20, 40, 60]),
              entidad: pick(['Ayuntamiento', 'Fundación Formación', 'SEPE']),
              fechaRealizacion: new Date(2024, i % 12, 10),
            },
          ],
        },
        incomeMembers: {
          create: [
            { numero: 1, tipo: 'Padre/Madre', cantidad: 800 + i * 50 },
            { numero: 2, tipo: 'Hermano/a', cantidad: i % 3 === 0 ? 400 : null },
          ],
        },
        diaryEntries: {
          create: [
            {
              content: `Entrada inicial para ${pick(nombres)} — primera entrevista realizada.`,
              date: new Date(2025, i % 6, 15),
              horas: pick([1 / 3, 2 / 3, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6]),
            },
          ],
        },

      },
    })
  }

  const total = await db.userProfile.count()
  console.log(`OK - ${total} usuarios de prueba creados`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
