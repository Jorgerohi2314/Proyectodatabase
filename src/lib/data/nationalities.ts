export interface NationalityOption {
  value: string
  label: string
  aliases?: string[]
}

export const NATIONALITIES: NationalityOption[] = [
  // --- EUROPA ---
  { value: "Albania", label: "Albania", aliases: ["Albana", "Albano", "Albanië"] },
  { value: "Alemania", label: "Alemania", aliases: ["Alemana", "Aleman"] },
  { value: "Andorra", label: "Andorra", aliases: ["Andorrana", "Andorrano"] },
  { value: "Austria", label: "Austria", aliases: ["Austriaca", "Austriaco"] },
  { value: "Bélgica", label: "Bélgica", aliases: ["Belgica", "Belga"] },
  { value: "Bielorrusia", label: "Bielorrusia", aliases: ["Bielorruso", "Belarrúsia"] },
  { value: "Bosnia y Herzegovina", label: "Bosnia y Herzegovina", aliases: ["Bosnia", "Bosnio", "Bosnia-Herzegovina"] },
  { value: "Bulgaria", label: "Bulgaria", aliases: ["Búlgara", "Búlgaro", "Bulgaro"] },
  { value: "Croacia", label: "Croacia", aliases: ["Croata"] },
  { value: "Dinamarca", label: "Dinamarca", aliases: ["Danés", "Danesa", "Danes"] },
  { value: "Eslovaquia", label: "Eslovaquia", aliases: ["Eslovaca", "Eslovaco"] },
  { value: "Eslovenia", label: "Eslovenia", aliases: ["Eslovena", "Esloveno"] },
  { value: "España", label: "España", aliases: ["Española", "Español", "Espana"] },
  { value: "Estonia", label: "Estonia", aliases: ["Estoniana", "Estoniano"] },
  { value: "Finlandia", label: "Finlandia", aliases: ["Finlandesa", "Finlandés", "Finlandes"] },
  { value: "Francia", label: "Francia", aliases: ["Francesa", "Francés", "Frances"] },
  { value: "Grecia", label: "Grecia", aliases: ["Griega", "Griego"] },
  { value: "Hungría", label: "Hungría", aliases: ["Hungria", "Húngara", "Húngaro", "Hungaro"] },
  { value: "Irlanda", label: "Irlanda", aliases: ["Irlandesa", "Irlandés", "Irlandes"] },
  { value: "Islandia", label: "Islandia", aliases: ["Islandesa", "Islandés", "Islandes"] },
  { value: "Italia", label: "Italia", aliases: ["Italiana", "Italiano"] },
  { value: "Kosovo", label: "Kosovo", aliases: ["Kosovar", "Kosovar"] },
  { value: "Letonia", label: "Letonia", aliases: ["Letona", "Letón", "Leton"] },
  { value: "Lituania", label: "Lituania", aliases: ["Lituana", "Lituano"] },
  { value: "Luxemburgo", label: "Luxemburgo", aliases: ["Luxemburguesa", "Luxemburgués", "Luxemburgues"] },
  { value: "Macedonia del Norte", label: "Macedonia del Norte", aliases: ["Macedonia", "Macedonio"] },
  { value: "Malta", label: "Malta", aliases: ["Maltesa", "Maltés", "Maltes"] },
  { value: "Moldavia", label: "Moldavia", aliases: ["Moldava", "Moldavo"] },
  { value: "Mónaco", label: "Mónaco", aliases: ["Monaco", "Monegasca", "Monegasco"] },
  { value: "Montenegro", label: "Montenegro", aliases: ["Montenegrina", "Montenegrino"] },
  { value: "Noruega", label: "Noruega", aliases: ["Noruega", "Noruego", "Norueca"] },
  { value: "Países Bajos", label: "Países Bajos", aliases: ["Holanda", "Neerlandesa", "Neerlandés", "Holandesa", "Holandés", "Holandes"] },
  { value: "Polonia", label: "Polonia", aliases: ["Polaca", "Polaco"] },
  { value: "Portugal", label: "Portugal", aliases: ["Portuguesa", "Portugués", "Portugues"] },
  { value: "Reino Unido", label: "Reino Unido", aliases: ["Británica", "Británico", "Inglaterra", "Inglesa", "Inglés", "Ingles", "Gales", "Escocia"] },
  { value: "República Checa", label: "República Checa", aliases: ["Checa", "Checo", "Chequia"] },
  { value: "Rumanía", label: "Rumanía", aliases: ["Rumania", "Rumana", "Rumano"] },
  { value: "Rusia", label: "Rusia", aliases: ["Rusa", "Ruso"] },
  { value: "San Marino", label: "San Marino", aliases: ["Sanmarinense"] },
  { value: "Serbia", label: "Serbia", aliases: ["Serbia", "Serbio", "Servia"] },
  { value: "Suecia", label: "Suecia", aliases: ["Sueco"] },
  { value: "Suiza", label: "Suiza", aliases: ["Suizo", "Suiza"] },
  { value: "Ucrania", label: "Ucrania", aliases: ["Ucraniana", "Ucraniano"] },
  { value: "Vaticano", label: "Vaticano", aliases: ["Vaticana", "Vaticano"] },

  // --- AFRICA ---
  { value: "Argelia", label: "Argelia", aliases: ["Argelina", "Argelino"] },
  { value: "Angola", label: "Angola", aliases: ["Angoleña", "Angoleño"] },
  { value: "Benín", label: "Benín", aliases: ["Benin", "Beninesa", "Beninés"] },
  { value: "Botsuana", label: "Botsuana", aliases: ["Botsuano", "Botswana"] },
  { value: "Burkina Faso", label: "Burkina Faso", aliases: ["Burkinabé", "Burkinesa"] },
  { value: "Burundi", label: "Burundi", aliases: ["Burundesa", "Burundés"] },
  { value: "Cabo Verde", label: "Cabo Verde", aliases: ["Cabo Verdiano", "Cabo verdiano"] },
  { value: "Camerún", label: "Camerún", aliases: ["Camerun", "Camerunesa", "Camerunés"] },
  { value: "Chad", label: "Chad", aliases: ["Chadiana", "Chadiano"] },
  { value: "Comoras", label: "Comoras", aliases: ["Comorense", "Comorense"] },
  { value: "Congo", label: "Congo", aliases: ["Congoleña", "Congoleño", "Congo-Brazzaville"] },
  { value: "Costa de Marfil", label: "Costa de Marfil", aliases: ["Marfileña", "Marfileño", "Ivorian"] },
  { value: "Djibuti", label: "Djibuti", aliases: ["Yibuti", "Yibutiana", "Yibutiano"] },
  { value: "Egipto", label: "Egipto", aliases: ["Egipcia", "Egipcio"] },
  { value: "Eritrea", label: "Eritrea", aliases: ["Eritrea", "Eritrea"] },
  { value: "Esuatini", label: "Esuatini", aliases: ["Suazilandia", "Suazi", "Esuatini"] },
  { value: "Etiopía", label: "Etiopía", aliases: ["Etiopia", "Etiope", "Etiope"] },
  { value: "Gabón", label: "Gabón", aliases: ["Gabon", "Gabonesa", "Gabonés"] },
  { value: "Gambia", label: "Gambia", aliases: ["Gambiana", "Gambiano"] },
  { value: "Ghana", label: "Ghana", aliases: ["Ghanesa", "Ghanés", "Ghanes"] },
  { value: "Guinea", label: "Guinea", aliases: ["Guineana", "Guineano"] },
  { value: "Guinea Ecuatorial", label: "Guinea Ecuatorial", aliases: ["Ecuatoguineana", "Ecuatoguineano", "Guinea Ecuatorial"] },
  { value: "Guinea-Bisáu", label: "Guinea-Bisáu", aliases: ["Guinea Bissau", "Guineano-Bisauense"] },
  { value: "Kenia", label: "Kenia", aliases: ["Keniana", "Keniano", "Kenya"] },
  { value: "Lesoto", label: "Lesoto", aliases: ["Lesotense", "Lesotano"] },
  { value: "Liberia", label: "Liberia", aliases: ["Liberiana", "Liberiano"] },
  { value: "Libia", label: "Libia", aliases: ["Libio", "Libia"] },
  { value: "Madagascar", label: "Madagascar", aliases: ["Malgache", "Madagascarí"] },
  { value: "Malaui", label: "Malaui", aliases: ["Malaui", "Malauí"] },
  { value: "Malí", label: "Malí", aliases: ["Mali", "Maliensa", "Maliense"] },
  { value: "Marruecos", label: "Marruecos", aliases: ["Marroquí", "Marroquie", "Marroquesa"] },
  { value: "Mauritania", label: "Mauritania", aliases: ["Mauritana", "Mauritano"] },
  { value: "Mauricio", label: "Mauricio", aliases: ["Mauriciano", "Maurician"] },
  { value: "Mozambique", label: "Mozambique", aliases: ["Mozambiqueño", "Mozambiqueña"] },
  { value: "Namibia", label: "Namibia", aliases: ["Namibia", "Namibia"] },
  { value: "Níger", label: "Níger", aliases: ["Niger", "Nigeriana", "Nigeriano"] },
  { value: "Nigeria", label: "Nigeria", aliases: ["Nigeriana", "Nigeriano"] },
  { value: "República Centroafricana", label: "República Centroafricana", aliases: ["Centroafricana", "Centroafricano"] },
  { value: "República Democrática del Congo", label: "República Democrática del Congo", aliases: ["Congo-Kinshasa", "Zaire"] },
  { value: "Ruanda", label: "Ruanda", aliases: ["Ruandesa", "Ruandés"] },
  { value: "Santo Tomé y Príncipe", label: "Santo Tomé y Príncipe", aliases: ["Santotomense"] },
  { value: "Senegal", label: "Senegal", aliases: ["Senegalesa", "Senegalés", "Senegales"] },
  { value: "Seychelles", label: "Seychelles", aliases: ["Seychelense"] },
  { value: "Sierra Leona", label: "Sierra Leona", aliases: ["Sierraleonense"] },
  { value: "Somalia", label: "Somalia", aliases: ["Somalí", "Somali", "Somaliense"] },
  { value: "Sudáfrica", label: "Sudáfrica", aliases: ["Sudafrica", "Sudafricana", "Surafricana"] },
  { value: "Sudán", label: "Sudán", aliases: ["Sudan", "Sudanesa", "Sudanés", "Sudanes"] },
  { value: "Sudán del Sur", label: "Sudán del Sur", aliases: ["Sudanesa del Sur"] },
  { value: "Tanzania", label: "Tanzania", aliases: ["Tanzana", "Tanzano"] },
  { value: "Togo", label: "Togo", aliases: ["Togolés", "Togolesa"] },
  { value: "Túnez", label: "Túnez", aliases: ["Tunez", "Tunecina", "Tunecino"] },
  { value: "Uganda", label: "Uganda", aliases: ["Ugandesa", "Ugandés"] },
  { value: "Zambia", label: "Zambia", aliases: ["Zambiana", "Zambiano"] },
  { value: "Zimbabue", label: "Zimbabue", aliases: ["Zimbabuense", "Zimbabuo"] },

  // --- AMÉRICA ---
  { value: "Argentina", label: "Argentina", aliases: ["Argentino"] },
  { value: "Bolivia", label: "Bolivia", aliases: ["Boliviana", "Boliviano"] },
  { value: "Brasil", label: "Brasil", aliases: ["Brasileña", "Brasileño", "Brasilera"] },
  { value: "Canadá", label: "Canadá", aliases: ["Canada", "Canadiense"] },
  { value: "Chile", label: "Chile", aliases: ["Chilena", "Chileno"] },
  { value: "Colombia", label: "Colombia", aliases: ["Colombiana", "Colombiano"] },
  { value: "Costa Rica", label: "Costa Rica", aliases: ["Costarricense"] },
  { value: "Cuba", label: "Cuba", aliases: ["Cubana", "Cubano"] },
  { value: "Ecuador", label: "Ecuador", aliases: ["Ecuatoriana", "Ecuatoriano"] },
  { value: "El Salvador", label: "El Salvador", aliases: ["Salvadoreña", "Salvadoreño"] },
  { value: "Estados Unidos", label: "Estados Unidos", aliases: ["Estadounidense", "Americana", "Americano", "EEUU", "USA", "EE.UU."] },
  { value: "Guatemala", label: "Guatemala", aliases: ["Guatemalteca", "Guatemalteco"] },
  { value: "Haití", label: "Haití", aliases: ["Haiti", "Haitiana", "Haitiano"] },
  { value: "Honduras", label: "Honduras", aliases: ["Hondureña", "Hondureño"] },
  { value: "Jamaica", label: "Jamaica", aliases: ["Jamaicana", "Jamaicano"] },
  { value: "México", label: "México", aliases: ["Mexico", "Mexicana", "Mexicano", "Mejicana", "Mejicano"] },
  { value: "Nicaragua", label: "Nicaragua", aliases: ["Nicaragüense", "Nicaraguense"] },
  { value: "Panamá", label: "Panamá", aliases: ["Panama", "Panameña", "Panameño"] },
  { value: "Paraguay", label: "Paraguay", aliases: ["Paraguaya", "Paraguayo"] },
  { value: "Perú", label: "Perú", aliases: ["Peru", "Peruana", "Peruano"] },
  { value: "Puerto Rico", label: "Puerto Rico", aliases: ["Puertorriqueña", "Puertorriqueño"] },
  { value: "República Dominicana", label: "República Dominicana", aliases: ["Dominicana", "Dominicano", "Dominica"] },
  { value: "Uruguay", label: "Uruguay", aliases: ["Uruguaya", "Uruguayo"] },
  { value: "Venezuela", label: "Venezuela", aliases: ["Venezolana", "Venezolano"] },

  // --- ASIA ---
  { value: "Afganistán", label: "Afganistán", aliases: ["Afgana", "Afgano"] },
  { value: "Arabia Saudita", label: "Arabia Saudita", aliases: ["Saudí", "Saudi"] },
  { value: "Armenia", label: "Armenia", aliases: ["Armenia", "Armenio"] },
  { value: "Azerbaiyán", label: "Azerbaiyán", aliases: ["Azerbaijaní", "Azerí"] },
  { value: "Bangladés", label: "Bangladés", aliases: ["Bangladesh", "Bangladesí", "Banglades"] },
  { value: "Baréin", label: "Baréin", aliases: ["Barein", "Bareiní"] },
  { value: "Birmania", label: "Birmania", aliases: ["Myanmar", "Birmano"] },
  { value: "Brunéi", label: "Brunéi", aliases: ["Brunei", "Bruneano"] },
  { value: "Camboya", label: "Camboya", aliases: ["Camboyano", "Camboyana"] },
  { value: "Catar", label: "Catar", aliases: ["Qatar", "Catarí"] },
  { value: "China", label: "China", aliases: ["Chino", "China"] },
  { value: "Chipre", label: "Chipre", aliases: ["Chipriota"] },
  { value: "Corea del Norte", label: "Corea del Norte", aliases: ["Norcoreana", "Norcoreano"] },
  { value: "Corea del Sur", label: "Corea del Sur", aliases: ["Surcoreana", "Surcoreano"] },
  { value: "Emiratos Árabes Unidos", label: "Emiratos Árabes Unidos", aliases: ["Emiratí", "EAU"] },
  { value: "Filipinas", label: "Filipinas", aliases: ["Filipina", "Filipino"] },
  { value: "Georgia", label: "Georgia", aliases: ["Georgiana", "Georgiano"] },
  { value: "India", label: "India", aliases: ["Indio", "India", "Hindú"] },
  { value: "Indonesia", label: "Indonesia", aliases: ["Indonesio", "Indonesa"] },
  { value: "Irak", label: "Irak", aliases: ["Iraquí", "Iraq", "Iraqí"] },
  { value: "Irán", label: "Irán", aliases: ["Iran", "Iraní", "Irania", "Iranio"] },
  { value: "Israel", label: "Israel", aliases: ["Israelí", "Israelita"] },
  { value: "Japón", label: "Japón", aliases: ["Japon", "Japonesa", "Japonés", "Japones"] },
  { value: "Jordania", label: "Jordania", aliases: ["Jordana", "Jordano"] },
  { value: "Kazajistán", label: "Kazajistán", aliases: ["Kazajistan", "Kazaja", "Kazajo"] },
  { value: "Kirguistán", label: "Kirguistán", aliases: ["Kirguistan", "Kirguisa", "Kirguiso"] },
  { value: "Kuwait", label: "Kuwait", aliases: ["Kuwaití"] },
  { value: "Laos", label: "Laos", aliases: ["Laosiana", "Laosiano"] },
  { value: "Líbano", label: "Líbano", aliases: ["Libano", "Libanesa", "Libanés", "Libanes"] },
  { value: "Malasia", label: "Malasia", aliases: ["Malaya", "Malayo", "Malasio"] },
  { value: "Maldivas", label: "Maldivas", aliases: ["Maldiva", "Maldivo"] },
  { value: "Mongolia", label: "Mongolia", aliases: ["Mongola", "Mongol"] },
  { value: "Nepal", label: "Nepal", aliases: ["Nepalí", "Nepali"] },
  { value: "Omán", label: "Omán", aliases: ["Oman", "Omaní"] },
  { value: "Pakistán", label: "Pakistán", aliases: ["Pakistan", "Pakistaní", "Pakistani"] },
  { value: "Palestina", label: "Palestina", aliases: ["Palestino"] },
  { value: "Qatar", label: "Qatar", aliases: ["Catar", "Catarí"] },
  { value: "Singapur", label: "Singapur", aliases: ["Singapurense"] },
  { value: "Siria", label: "Siria", aliases: ["Sirio", "Siria"] },
  { value: "Sri Lanka", label: "Sri Lanka", aliases: ["Ceilán", "Esrilanquesa"] },
  { value: "Tailandia", label: "Tailandia", aliases: ["Tailandesa", "Tailandés", "Tailandes"] },
  { value: "Taiwán", label: "Taiwán", aliases: ["Taiwan", "Taiwanesa", "Taiwanés", "Taiwanes"] },
  { value: "Tayikistán", label: "Tayikistán", aliases: ["Tayiko", "Tayika"] },
  { value: "Timor Oriental", label: "Timor Oriental", aliases: ["Timorense"] },
  { value: "Turkmenistán", label: "Turkmenistán", aliases: ["Turcomana", "Turcomano"] },
  { value: "Turquía", label: "Turquía", aliases: ["Turquia", "Turca", "Turco"] },
  { value: "Uzbekistán", label: "Uzbekistán", aliases: ["Uzbekistan", "Uzbeka", "Uzbeca", "Uzbeko"] },
  { value: "Vietnam", label: "Vietnam", aliases: ["Vietnamita"] },
  { value: "Yemen", label: "Yemen", aliases: ["Yemení", "Yemeni"] },

  // --- OCEANÍA ---
  { value: "Australia", label: "Australia", aliases: ["Australiana", "Australiano"] },
  { value: "Nueva Zelanda", label: "Nueva Zelanda", aliases: ["Neozelandesa", "Neozelandés", "Neozelandes"] },
]

export function normalizeNationality(value: string | null | undefined): string {
  if (!value) return ""
  const trimmed = value.trim()
  if (!trimmed) return ""

  const match = NATIONALITIES.find((n) => normKey(n.value) === normKey(trimmed))
  if (match) return match.value

  const aliasMatch = NATIONALITIES.find((n) =>
    (n.aliases ?? []).some((a) => normKey(a) === normKey(trimmed))
  )
  if (aliasMatch) return aliasMatch.value

  return trimmed
}

export function searchNationalities(query: string, limit = 30): NationalityOption[] {
  const q = normKey(query)
  if (!q) return NATIONALITIES.slice(0, limit)

  return NATIONALITIES.filter((n) => {
    return (
      normKey(n.value).includes(q) ||
      (n.aliases ?? []).some((a) => normKey(a).includes(q))
    )
  }).slice(0, limit)
}

function normKey(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}