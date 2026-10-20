export interface SaveUserResult {
  userId: string
  curriculumMessage: string
  profilePictureMessage: string
}

export async function saveUser(
  userId: string | null,
  data: any,
  curriculumFile?: File | null,
  profilePictureFile?: File | null
): Promise<SaveUserResult> {
  const isUpdating = !!userId
  const endpoint = isUpdating ? `/api/users/${userId}` : "/api/users"
  const method = isUpdating ? "PUT" : "POST"

  const userResponse = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!userResponse.ok) {
    const errorData = await userResponse.json().catch(() => null)
    throw new Error(
      errorData?.error || `Error al ${isUpdating ? "actualizar" : "crear"} el usuario`
    )
  }

  const savedUser = await userResponse.json()
  const savedUserId = savedUser.id
  let curriculumMessage = ""
  let profilePictureMessage = ""

  if (curriculumFile && savedUserId) {
    const formData = new FormData()
    formData.append("curriculum", curriculumFile)

    const fileResponse = await fetch(`/api/users/${savedUserId}/curriculum`, {
      method: "POST",
      body: formData,
    })

    if (fileResponse.ok) {
      curriculumMessage = "Currículum subido con éxito."
    } else {
      const fileError = await fileResponse.json().catch(() => null)
      curriculumMessage = `El perfil se guardó, pero falló la subida del currículum: ${fileError?.error ?? "error desconocido"}`
    }
  }

  if (profilePictureFile && savedUserId) {
    const formData = new FormData()
    formData.append("profilePicture", profilePictureFile)

    const fileResponse = await fetch(`/api/users/${savedUserId}/profile-picture`, {
      method: "POST",
      body: formData,
    })

    if (fileResponse.ok) {
      profilePictureMessage = "Foto de perfil subida con éxito."
    } else {
      const fileError = await fileResponse.json().catch(() => null)
      profilePictureMessage = `El perfil se guardó, pero falló la subida de la foto de perfil: ${fileError?.error ?? "error desconocido"}`
    }
  }

  return { userId: savedUserId, curriculumMessage, profilePictureMessage }
}
