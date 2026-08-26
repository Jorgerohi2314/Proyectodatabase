import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import { createUserProfile, createUserWithFullData, seedUsers, cleanDatabase } from './factories'

describe('Base de datos de prueba (SQLite)', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  it('crea y lee un usuario básico', async () => {
    const user = await createUserProfile({ nombre: 'TestNombre' })

    expect(user.id).toBeTruthy()
    expect(user.nombre).toBe('TestNombre')

    const found = await db.userProfile.findUnique({ where: { id: user.id } })
    expect(found?.email).toBe(user.email)
  })

  it('crea un usuario con todos los datos relacionados', async () => {
    const user = await createUserWithFullData()

    expect(user.socioEconomicData).not.toBeNull()
    expect(user.educationData?.formacionAcademica).toBe('ESO')
    expect(user.complementaryCourses).toHaveLength(2)
    expect(user.incomeMembers).toHaveLength(2)
    expect(user.diaryEntries).toHaveLength(2)
  })

  it('genera múltiples usuarios con seedUsers', async () => {
    const users = await seedUsers(5)

    expect(users).toHaveLength(5)

    const count = await db.userProfile.count()
    expect(count).toBe(5)
  })

  it('elimina en cascada al borrar un usuario', async () => {
    const user = await createUserWithFullData()

    await db.userProfile.delete({ where: { id: user.id } })

    expect(await db.diaryEntry.count()).toBe(0)
    expect(await db.educationData.count()).toBe(0)
    expect(await db.userProfile.count()).toBe(0)
  })
})
