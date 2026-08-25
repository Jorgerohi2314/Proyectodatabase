# GUÍA DE MIGRACIÓN: Next.js → JavaFX + Spring Boot

## 1. INTRODUCCIÓN

Esta guía documenta la migración completa de **Proyectodatabase** desde su arquitectura actual (Next.js 15 + TypeScript + Prisma + PostgreSQL) a una aplicación de escritorio JavaFX con backend Spring Boot y la misma base de datos PostgreSQL.

### Stack destino

| Capa | Tecnología |
|------|-----------|
| Frontend (UI) | JavaFX 21+ con FXML y SceneBuilder |
| Backend (API) | Spring Boot 3.x |
| ORM | Spring Data JPA / Hibernate |
| BD | PostgreSQL (sin cambios) |
| Auth | Spring Security + JWT |
| PDF | Apache PDFBox o iText |
| Almacenamiento | Spring MultipartFile + sistema de archivos local / S3 |
| WebSocket | Spring WebSocket |
| Build | Maven o Gradle |

---

## 2. ESTRUCTURA DEL PROYECTO

### Actual (Next.js)

```
webapp/
├── src/
│   ├── app/                    # Páginas (routing por carpetas)
│   │   ├── login/
│   │   ├── page.tsx            # Home (CRUD usuarios)
│   │   └── stats/
│   ├── components/             # UI components
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utilidades, BD, API
│   └── contexts/               # React contexts
├── prisma/
│   └── schema.prisma
└── package.json
```

### Destino (Spring Boot + JavaFX)

```
gestion-usuarios/
├── backend/                          # Spring Boot (REST API)
│   ├── src/main/java/com/app/
│   │   ├── config/                   # Security, CORS, WebSocket
│   │   ├── controller/               # REST controllers
│   │   ├── dto/                      # Data Transfer Objects
│   │   ├── entity/                   # JPA entities
│   │   ├── enums/                    # Enums compartidos
│   │   ├── repository/              # Spring Data repositories
│   │   ├── service/                  # Lógica de negocio
│   │   └── storage/                  # File storage abstraction
│   └── src/main/resources/
│       └── application.yml
├── frontend/                         # Aplicación JavaFX
│   ├── src/main/java/com/app/
│   │   ├── Main.java                 # Entry point
│   │   ├── controller/               # Controladores FXML
│   │   ├── model/                    # Modelos (DTOs)
│   │   ├── service/                  # Cliente HTTP (Feign/RestTemplate)
│   │   ├── util/                     # Utilidades
│   │   └── view/                     # FXML + CSS
│   └── src/main/resources/
│       └── views/                    # Archivos .fxml
└── pom.xml (o build.gradle)
```

---

## 3. CAPA DE BASE DE DATOS: Prisma → JPA

### Schema Prisma actual → Entidades JPA

Cada modelo Prisma se convierte en una clase `@Entity` de JPA. Las relaciones se mapean con anotaciones estándar (`@OneToOne`, `@OneToMany`, `@ManyToOne`).

**Ejemplo: UserProfile → UsuarioEntity**

```java
@Entity
@Table(name = "UserProfile")
public class UsuarioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellidos;

    @Enumerated(EnumType.STRING)
    private UserSource source;  // PROPIO, DERIVADO

    private LocalDate fechaNacimiento;
    private String nacionalidad;
    private String documentoIdentidad;
    private String numeroSeguridadSocial;

    @Enumerated(EnumType.STRING)
    private Gender sexo;         // HOMBRE, MUJER

    private String direccion;
    private String localidad;
    private String codigoPostal;
    private String telefono1;
    private String telefono2;
    private String email;

    @Enumerated(EnumType.STRING)
    private YesNo carnetConducir;

    @Enumerated(EnumType.STRING)
    private YesNo vehiculoPropio;

    @Enumerated(EnumType.STRING)
    private YesNo tieneDiscapacidad;

    private Double porcentajeDiscapacidad;
    private String tipoDiscapacidad;
    private String entidadDerivacion;
    private String tecnicoDerivacion;
    private String colectivo;

    @Enumerated(EnumType.STRING)
    private YesNo insertado;

    private String sector;
    private String empresa;

    @Lob
    private byte[] curriculum;

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private SocioEconomicoEntity datosSocioEconomicos;

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private FormacionEntity datosFormativos;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CursoComplementarioEntity> cursosComplementarios;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IngresoEntity> ingresos;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DiarioEntity> diario;

    // getters, setters, equals, hashCode
}
```

### Entidades hijas (1:1)

```java
@Entity
@Table(name = "SocioEconomicData")
public class SocioEconomicoEntity {
    @Id
    private String id;  // mismo UUID que UserProfile

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private UsuarioEntity usuario;

    private String composicionFamiliar;
    private String situacionEconomica;
    private String otrasCircunstancias;
}

@Entity
@Table(name = "EducationData")
public class FormacionEntity {
    @Id
    private String id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private UsuarioEntity usuario;

    @Enumerated(EnumType.STRING)
    private AcademicLevel formacionAcademica;

    private Integer anioFinalizacion;
    private String especificacionOtros;

    @Enumerated(EnumType.STRING)
    private YesNo experienciaLaboralPrevia;
}
```

### Entidades hijas (1:N)

```java
@Entity
@Table(name = "ComplementaryCourse")
public class CursoComplementarioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private UsuarioEntity usuario;

    private String nombreCurso;
    private Integer duracionHoras;
    private String entidad;
    private LocalDate fechaRealizacion;
}

@Entity
@Table(name = "IncomeMember")
public class IngresoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private UsuarioEntity usuario;

    private String numero;
    private String tipo;
    private BigDecimal cantidad;
}

@Entity
@Table(name = "DiaryEntry")
public class DiarioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private UsuarioEntity usuario;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt;
}
```

### Enums compartidos

```java
public enum AcademicLevel {
    SIN_ESTUDIOS, PRIMARIA_INCOMPLETA, PRIMARIA_COMPLETA, ESO,
    BACHILLERATO, FP_MEDIO, FP_SUPERIOR, GRADO_MEDIO, GRADO_SUPERIOR,
    DIPLOMATURA, LICENCIATURA_GRADO, MASTER, DOCTORADO
}

public enum Gender { HOMBRE, MUJER }
public enum YesNo { SI, NO }
public enum UserSource { PROPIO, DERIVADO }
```

### Repositories

```java
@Repository
public interface UsuarioRepository extends JpaRepository<UsuarioEntity, String> {

    @Query("SELECT u FROM UsuarioEntity u WHERE " +
           "(:nombre IS NULL OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) AND " +
           "(:apellidos IS NULL OR LOWER(u.apellidos) LIKE LOWER(CONCAT('%', :apellidos, '%'))) AND " +
           "(:formacion IS NULL OR u.datosFormativos.formacionAcademica = :formacion) AND " +
           "(:experiencia IS NULL OR u.datosFormativos.experienciaLaboralPrevia = :experiencia)")
    List<UsuarioEntity> buscarConFiltros(String nombre, String apellidos,
                                         AcademicLevel formacion, YesNo experiencia);

    @Query("SELECT u.sector, COUNT(u) FROM UsuarioEntity u " +
           "WHERE u.insertado = 'SI' AND u.sector IS NOT NULL " +
           "GROUP BY u.sector ORDER BY COUNT(u) DESC")
    List<Object[]> agruparInsercionPorSector();

    @Query("SELECT u.empresa, COUNT(u) FROM UsuarioEntity u " +
           "WHERE u.insertado = 'SI' AND u.empresa IS NOT NULL " +
           "AND (:filter IS NULL OR u.sector = :filter) " +
           "GROUP BY u.empresa ORDER BY COUNT(u) DESC")
    List<Object[]> rankingEmpresas(String filter);
}
```

---

## 4. API REST: API Routes Next.js → Spring Controllers

### Mapeo endpoint por endpoint

| Next.js API Route | Spring Controller Endpoint | Método |
|---|---|---|
| `GET /api/users` | `GET /api/usuarios` | `UsuarioController.listar()` |
| `POST /api/users` | `POST /api/usuarios` | `UsuarioController.crear()` |
| `GET /api/users/[id]` | `GET /api/usuarios/{id}` | `UsuarioController.obtener()` |
| `PUT /api/users/[id]` | `PUT /api/usuarios/{id}` | `UsuarioController.actualizar()` |
| `DELETE /api/users/[id]` | `DELETE /api/usuarios/{id}` | `UsuarioController.eliminar()` |
| `POST /api/users/[id]/curriculum` | `POST /api/usuarios/{id}/curriculum` | `CurriculumController.subir()` |
| `GET /api/users/[id]/curriculum` | `GET /api/usuarios/{id}/curriculum` | `CurriculumController.obtener()` |
| `DELETE /api/users/[id]/curriculum` | `DELETE /api/usuarios/{id}/curriculum` | `CurriculumController.eliminar()` |
| `GET/POST /api/users/[id]/diary` | `GET/POST /api/usuarios/{id}/diario` | `DiarioController` |
| `GET /api/users/insercion` | `GET /api/usuarios/estadisticas/insercion` | `EstadisticasController` |
| `GET /api/stats/insercion?filter` | `GET /api/estadisticas/empresas?filter=` | `EstadisticasController.ranking()` |
| `GET /api/health` | `GET /api/health` | `HealthController` |

### Ejemplo: UsuarioController

```java
@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<UsuarioResumenDTO>> listar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String apellidos,
            @RequestParam(required = false) AcademicLevel formacionAcademica,
            @RequestParam(required = false) YesNo experienciaLaboralPrevia) {
        return ResponseEntity.ok(usuarioService.listarConFiltros(
                nombre, apellidos, formacionAcademica, experienciaLaboralPrevia));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDetalleDTO> obtener(@PathVariable String id) {
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioDetalleDTO> crear(@RequestBody @Valid CrearUsuarioRequest request) {
        UsuarioDetalleDTO usuario = usuarioService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDetalleDTO> actualizar(
            @PathVariable String id,
            @RequestBody @Valid ActualizarUsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
```

### DTOs

```java
public record UsuarioResumenDTO(
    String id, String nombre, String apellidos, UserSource source,
    LocalDate fechaNacimiento, String localidad, YesNo insertado,
    String sector, String empresa
) {}

public record UsuarioDetalleDTO(
    String id, String nombre, String apellidos, UserSource source,
    LocalDate fechaNacimiento, String nacionalidad, String documentoIdentidad,
    String numeroSeguridadSocial, Gender sexo,
    String direccion, String localidad, String codigoPostal,
    String telefono1, String telefono2, String email,
    YesNo carnetConducir, YesNo vehiculoPropio,
    YesNo tieneDiscapacidad, Double porcentajeDiscapacidad,
    String tipoDiscapacidad, String entidadDerivacion, String tecnicoDerivacion,
    String colectivo, YesNo insertado, String sector, String empresa,
    SocioEconomicoDTO datosSocioEconomicos,
    FormacionDTO datosFormativos,
    List<CursoDTO> cursosComplementarios,
    List<IngresoDTO> ingresos
) {}

public record CrearUsuarioRequest(
    @NotBlank String nombre,
    @NotBlank String apellidos,
    @NotNull UserSource source,
    LocalDate fechaNacimiento,
    String nacionalidad,
    String documentoIdentidad,
    String numeroSeguridadSocial,
    Gender sexo,
    String direccion, String localidad, String codigoPostal,
    String telefono1, String telefono2, String email,
    YesNo carnetConducir, YesNo vehiculoPropio,
    YesNo tieneDiscapacidad, Double porcentajeDiscapacidad,
    String tipoDiscapacidad, String entidadDerivacion,
    String tecnicoDerivacion, String colectivo,
    YesNo insertado, String sector, String empresa,
    SocioEconomicoDTO datosSocioEconomicos,
    FormacionDTO datosFormativos,
    List<CursoDTO> cursosComplementarios,
    List<IngresoDTO> ingresos
) {}
```

### CurriculumController (file upload)

```java
@RestController
@RequestMapping("/api/usuarios/{id}/curriculum")
public class CurriculumController {

    private final CurriculumService curriculumService;

    @PostMapping
    public ResponseEntity<Void> subir(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        curriculumService.subirCurriculum(id, file);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<Resource> obtener(@PathVariable String id) {
        // Validar tipo de contenido (application/pdf)
        Resource resource = curriculumService.obtenerCurriculum(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    @DeleteMapping
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        curriculumService.eliminarCurriculum(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## 5. SERVICIOS: Lógica de negocio

### UsuarioService

```java
@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public List<UsuarioResumenDTO> listarConFiltros(String nombre, String apellidos,
                                                     AcademicLevel formacion, YesNo experiencia) {
        return usuarioRepository.buscarConFiltros(nombre, apellidos, formacion, experiencia)
                .stream()
                .map(this::toResumenDTO)
                .toList();
    }

    public UsuarioDetalleDTO obtenerPorId(String id) {
        UsuarioEntity usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return toDetalleDTO(usuario);
    }

    public UsuarioDetalleDTO crear(CrearUsuarioRequest request) {
        UsuarioEntity usuario = new UsuarioEntity();
        // mapear campos...
        if (request.datosSocioEconomicos() != null) {
            SocioEconomicoEntity socio = new SocioEconomicoEntity();
            socio.setComposicionFamiliar(request.datosSocioEconomicos().composicionFamiliar());
            socio.setSituacionEconomica(request.datosSocioEconomicos().situacionEconomica());
            socio.setOtrasCircunstancias(request.datosSocioEconomicos().otrasCircunstancias());
            socio.setUsuario(usuario);
            usuario.setDatosSocioEconomicos(socio);
        }
        // mismo patrón para FormacionEntity
        usuario = usuarioRepository.save(usuario);
        return toDetalleDTO(usuario);
    }

    public UsuarioDetalleDTO actualizar(String id, ActualizarUsuarioRequest request) {
        UsuarioEntity usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        // mapear campos actualizados...
        // para relaciones 1:1, obtener la entidad existente y actualizar campos
        // para 1:N, borrar todas las existentes y recrear (misma lógica que el transaction en Prisma)
        usuarioRepository.flush(); // asegurar orden
        return toDetalleDTO(usuario);
    }

    public void eliminar(String id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
    }

    // métodos toResumenDTO, toDetalleDTO...
}
```

### Transacciones: El equivalente al `$transaction` de Prisma

En Spring Boot, `@Transactional` maneja las transacciones automáticamente. Para la actualización de usuario que en Prisma usa `deleteMany + upsert + create`, en Spring JPA se hace:

```java
@Transactional
public UsuarioDetalleDTO actualizar(String id, ActualizarUsuarioRequest request) {
    UsuarioEntity usuario = usuarioRepository.findById(id).orElseThrow();

    // 1. Limpiar colecciones hijas que se reemplazan completamente
    usuario.getCursosComplementarios().clear();
    if (request.cursosComplementarios() != null) {
        for (CursoDTO c : request.cursosComplementarios()) {
            CursoComplementarioEntity curso = new CursoComplementarioEntity();
            // mapear campos
            curso.setUsuario(usuario);
            usuario.getCursosComplementarios().add(curso);
        }
    }

    // 2. Para 1:1, usar merge en la entidad existente
    if (usuario.getDatosSocioEconomicos() != null) {
        usuario.getDatosSocioEconomicos()
              .setComposicionFamiliar(request.datosSocioEconomicos().composicionFamiliar());
        // ...
    } else if (request.datosSocioEconomicos() != null) {
        SocioEconomicoEntity socio = new SocioEconomicoEntity();
        // mapear
        socio.setUsuario(usuario);
        usuario.setDatosSocioEconomicos(socio);
    }

    usuarioRepository.save(usuario);
    return toDetalleDTO(usuario);
}
```

---

## 6. SEGURIDAD: Auth Context → Spring Security + JWT

### Configuración Spring Security

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

### Login hardcodeado (equivalente actual)

```java
@Service
public class AuthService {

    private static final String USERNAME = "milahidalgo";
    private static final String PASSWORD = "141414";
    private static final String ROL = "ADMIN";

    public AuthResponse login(AuthRequest request) {
        if (!USERNAME.equals(request.username()) || !PASSWORD.equals(request.password())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }
        String token = Jwts.builder()
                .subject(USERNAME)
                .claim("rol", ROL)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000)) // 24h
                .signWith(getSigningKey())
                .compact();
        return new AuthResponse(token, USERNAME, ROL);
    }
}
```

### Endpoint de login

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
```

### JWT Filter

```java
@Component
public class JwtFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            // validar token, extraer username, crear Authentication
            // set SecurityContextHolder.getContext().setAuthentication(auth)
        }
        chain.doFilter(request, response);
    }
}
```

---

## 7. FRONTEND JavaFX: Mapeo de Pantallas

### Home.java → Main.java (punto de entrada)

```java
public class Main extends Application {

    @Override
    public void start(Stage primaryStage) throws Exception {
        // LoginScreen primero
        FXMLLoader loader = new FXMLLoader(getClass().getResource("/views/LoginView.fxml"));
        Scene scene = new Scene(loader.load());
        scene.getStylesheets().add(getClass().getResource("/styles/app.css").toExternalForm());

        primaryStage.setTitle("Gestión de Usuarios - Proyectodatabase");
        primaryStage.setScene(scene);
        primaryStage.setMaximized(true);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
```

### LoginView.fxml → LoginController.java

```java
public class LoginController {
    @FXML private TextField usernameField;
    @FXML private PasswordField passwordField;
    @FXML private Label errorLabel;

    private final AuthService authService = new AuthService(); // HTTP client

    @FXML
    private void handleLogin() {
        String username = usernameField.getText();
        String password = passwordField.getText();

        try {
            AuthResponse response = authService.login(username, password);
            // Guardar token en sesión
            SessionManager.getInstance().setToken(response.token());
            SessionManager.getInstance().setUsername(response.username());

            // Navegar a pantalla principal
            SceneManager.switchScene("/views/MainView.fxml");
        } catch (Exception e) {
            errorLabel.setText("Credenciales inválidas");
            errorLabel.setVisible(true);
        }
    }
}
```

### MainView.fxml → Dashboard (Home)

```java
public class MainController implements Initializable {

    @FXML private Label welcomeLabel;
    @FXML private Label clockLabel;
    @FXML private TableView<UsuarioResumenDTO> userTable;
    @FXML private TextField searchNombreField;
    @FXML private TextField searchApellidosField;
    @FXML private ComboBox<AcademicLevel> searchFormacionCombo;
    @FXML private ComboBox<YesNo> searchExperienciaCombo;
    @FXML private Button crearUsuarioBtn;
    @FXML private Button estadisticasBtn;

    private final UsuarioService usuarioService = new UsuarioService();

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        welcomeLabel.setText("Hola, " + SessionManager.getInstance().getUsername());
        initClock();
        initTable();
        loadUsers();
    }

    private void initTable() {
        // Definir columnas
        TableColumn<UsuarioResumenDTO, String> nombreCol = new TableColumn<>("Nombre");
        nombreCol.setCellValueFactory(
            new PropertyValueFactory<>("nombreCompleto"));
        // misma configuración para apellidos, localidad, insertado, sector
        userTable.getColumns().addAll(nombreCol, apellidosCol, ...);

        // Botones de acción con TableCell personalizado
        TableColumn<UsuarioResumenDTO, Void> accionesCol = new TableColumn<>("Acciones");
        accionesCol.setCellFactory(col -> new ActionCell());
        userTable.getColumns().add(accionesCol);
    }

    @FXML
    private void handleSearch() {
        loadUsers();
    }

    private void loadUsers() {
        String nombre = searchNombreField.getText();
        String apellidos = searchApellidosField.getText();
        AcademicLevel formacion = searchFormacionCombo.getValue();
        YesNo experiencia = searchExperienciaCombo.getValue();

        List<UsuarioResumenDTO> users = usuarioService.listar(nombre, apellidos, formacion, experiencia);
        userTable.getItems().setAll(users);
    }
}
```

---

## 8. PANTALLAS Y COMPONENTES

### 8.1 Login (`LoginView.fxml`)

```
+--------------------------------------------+
|                                            |
|              [logo / icono]                 |
|              Gestión de Usuarios            |
|                                            |
|         Usuario: [________________]         |
|         Contraseña: [________________]      |
|                                            |
|         [  Iniciar Sesión  ]               |
|              (errorLabel)                   |
+--------------------------------------------+
```

### 8.2 Dashboard (`MainView.fxml`)

```
+------------------------------------------------------------------+
| [Hola, Mila]                     [Reloj]  [Crear] [Estadísticas] |
+------------------------------------------------------------------+
| Búsqueda:                                                         |
| Nombre: [____] Apellidos: [____]                                 |
| Formación: [v__________] Exp. Laboral: [v____] [Buscar]          |
+------------------------------------------------------------------+
| Tabla de Usuarios:                                                |
| +--------+-----------+-----------+--------+--------+-----------+ |
| | Nombre | Apellidos | Localidad | Inserc | Sector | Acciones  | |
| +--------+-----------+-----------+--------+--------+-----------+ |
| | Juan   | Pérez     | Madrid    | SI     | Hostel | [Ver]     | |
| | María  | López     | Barcelona | NO     | -      | [Ver]     | |
| +--------+-----------+-----------+--------+--------+-----------+ |
| [<<] [1] [2] [3] ... [>>]                                       |
+------------------------------------------------------------------+
```

### 8.3 Crear/Editar Usuario (ventana emergente)

```
+----------------------------------------+
|  Crear Usuario            [X] cerrar   |
+----------------------------------------+
| [Paso 1] [Paso 2] [Paso 3] [Paso 4]   |
+----------------------------------------+
|  PASO 1: DATOS PERSONALES              |
|  Nombre: [________________]            |
|  Apellidos: [________________]         |
|  Origen: [v PROPIO]                    |
|  Fecha Nac.: [dd/mm/aaaa]             |
|  Nacionalidad: [________________]      |
|  Documento Identidad: [____________]   |
|  Nº Seg. Social: [________________]    |
|  Sexo: [v HOMBRE] [v MUJER]           |
|  Dirección: [________________]         |
|  Localidad: [________________]         |
|  Código Postal: [_____]               |
|  Teléfono 1: [________________]        |
|  Teléfono 2: [________________]        |
|  Email: [________________]             |
|  Carnet Conducir: [v NO]              |
|  Vehículo Propio: [v NO]              |
|  Discapacidad: [v NO]                  |
|  [Si SI: % ____ Tipo: ________]        |
|                                        |
|       [< Anterior] [Siguiente >]       |
+----------------------------------------+
```

### 8.4 Detalle de Usuario (ventana emergente)

```
+----------------------------------------+
|  Detalle: Juan Pérez       [X] cerrar  |
+----------------------------------------+
| [Personales] [Socio-Econ] [Formativos] |
+----------------------------------------+
|  DATOS PERSONALES                       |
|  Nombre: Juan                          |
|  Apellidos: Pérez García               |
|  Origen: Propio                        |
|  Fecha Nac.: 15/03/1990               |
|  Nacionalidad: Española                |
|  Documento: 12345678A                  |
|  Nº SS: 123456789012                   |
|  Sexo: Hombre                          |
|  Dirección: Calle Mayor 12             |
|  Localidad: Madrid                     |
|  CP: 28001                             |
|  Teléfonos: 612345678 / 912345678      |
|  Email: juan@email.com                 |
|  Carnet: Sí | Vehículo: No            |
+----------------------------------------+
```

### 8.5 Estadísticas

```
+----------------------------------------+
|  Estadísticas de Inserción             |
+----------------------------------------+
|  Inserciones por Sector:               |
|  [Bar chart o TableView]               |
|  Hostelería: ████████████ 15           |
|  Construcción: ██████ 8               |
|  Limpieza: ████ 5                     |
|  Comercio: ██ 3                       |
+----------------------------------------+
|  Filtro por sector: [v Todos]         |
|  Ranking de Empresas:                  |
|  1. Empresa A (10 inserciones)         |
|  2. Empresa B (7 inserciones)          |
|  3. Empresa C (4 inserciones)          |
+----------------------------------------+
```

---

## 9. DIAGRAMA DE NAVEGACIÓN

```
[Inicio App]
    |
    v
[LoginView] ---credenciales incorrectas---> [LoginView (error)]
    |  (login ok)
    v
[MainView (Dashboard)]
    |
    +---[Buscar Usuarios]---> resultados en tabla
    |
    +---[Crear Usuario]-----> [UserFormView (modal)]
    |                            |  (multipaso / 5 pasos)
    |                            v
    |                         [UserFormView (final)]
    |                            |  (guardar)
    |                            v
    |                         [MainView (recargado)]
    |
    +---[Ver Usuario]--------> [UserDetailView (modal)]
    |                            |
    |                            +---[Pestaña Personales]
    |                            +---[Pestaña Socio-Económicos]
    |                            +---[Pestaña Formativos]
    |                            +---[Pestaña Diario]
    |
    +---[Editar Usuario]------> [UserFormView (modal, precargado)]
    |                            |  (guardar)
    |                            v
    |                         [MainView (recargado)]
    |
    +---[Eliminar Usuario]----> [Confirmación]
    |                            |  (sí)
    |                            v
    |                         [MainView (recargado)]
    |
    +---[Estadísticas]--------> [StatsView (ventana/pestaña)]
    |
    +---[Cerrar Sesión]-------> [LoginView]
```

---

## 10. COMPONENTES ESPECÍFICOS

### 10.1 Stepper multipaso (UserFormView)

```java
public class StepperController {

    @FXML private VBox stepIndicator;      // barras/pasos visuales
    @FXML private StackPane contentArea;   // contenido del paso actual
    @FXML private Button prevButton;
    @FXML private Button nextButton;
    @FXML private Button saveButton;

    private int currentStep = 0;
    private final List<Node> steps = new ArrayList<>();
    private final UserFormData formData = new UserFormData();

    @FXML
    private void nextStep() {
        if (currentStep < steps.size() - 1) {
            steps.get(currentStep).setVisible(false);
            currentStep++;
            steps.get(currentStep).setVisible(true);
            updateButtons();
        }
    }

    private void updateButtons() {
        prevButton.setDisable(currentStep == 0);
        nextButton.setVisible(currentStep < steps.size() - 1);
        saveButton.setVisible(currentStep == steps.size() - 1);
        // animar indicador visual
    }
}
```

### 10.2 CurriculumUploader (drag-and-drop)

```java
public class CurriculumUploadController {

    @FXML private VBox dropZone;
    @FXML private Label fileNameLabel;

    @FXML
    private void initialize() {
        dropZone.setOnDragOver(event -> {
            if (event.getDragboard().hasFiles()) {
                event.acceptTransferModes(TransferMode.COPY);
                dropZone.getStyleClass().add("drag-over");
            }
        });
        dropZone.setOnDragDropped(event -> {
            Dragboard db = event.getDragboard();
            if (db.hasFiles()) {
                File file = db.getFiles().get(0);
                if (file.getName().endsWith(".pdf") && file.length() <= 5 * 1024 * 1024) {
                    fileNameLabel.setText(file.getName());
                    formData.setCurriculumFile(file);
                } else {
                    showAlert("Solo archivos PDF de hasta 5MB");
                }
            }
        });
    }
}
```

### 10.3 PillNav (navegación tipo píldora)

```java
public class PillNavController {

    @FXML private HBox pillContainer;
    private final List<ToggleButton> pills = new ArrayList<>();

    @FXML
    private void initialize() {
        String[] items = {"Personales", "Socio-Económicos", "Formativos", "Diario", "Currículum"};
        ToggleGroup group = new ToggleGroup();
        for (String item : items) {
            ToggleButton pill = new ToggleButton(item);
            pill.setToggleGroup(group);
            pill.getStyleClass().add("pill");
            pillContainer.getChildren().add(pill);
            pills.add(pill);
        }
        pills.get(0).setSelected(true);
    }
}
```

---

## 11. ESTILOS Y DISEÑO (CSS JavaFX → app.css)

```css
/* app.css - Sistema de diseño */

/* Paleta */
.root {
    -fx-primary: #fbe311;
    -fx-secondary: #261606;
    -fx-bg: #f8fafc;
    -fx-surface: rgba(255, 255, 255, 0.8);
    -fx-text: #1e293b;
    -fx-border-radius: 16px;
}

/* Botón primario */
.btn-primary {
    -fx-background-color: -fx-primary;
    -fx-text-fill: -fx-secondary;
    -fx-font-weight: bold;
    -fx-background-radius: 16px;
    -fx-padding: 10 24;
    -fx-cursor: hand;
}
.btn-primary:hover {
    -fx-opacity: 0.9;
}

/* Botón secundario */
.btn-secondary {
    -fx-background-color: -fx-secondary;
    -fx-text-fill: white;
    -fx-background-radius: 16px;
    -fx-padding: 10 24;
}
.btn-secondary:hover {
    -fx-background-color: derive(-fx-secondary, 20%);
}

/* Campos de texto */
.text-field, .password-field, .combo-box {
    -fx-background-color: white;
    -fx-border-color: #e2e8f0;
    -fx-border-radius: 16px;
    -fx-background-radius: 16px;
    -fx-padding: 8 16;
    -fx-font-size: 14px;
}
.text-field:focused, .password-field:focused {
    -fx-border-color: -fx-primary;
    -fx-effect: dropshadow(gaussian, rgba(251, 227, 17, 0.3), 8, 0, 0, 0);
}

/* Tabla */
.table-view {
    -fx-background-color: transparent;
    -fx-border-radius: 16px;
}
.table-view .column-header {
    -fx-background-color: -fx-primary;
    -fx-text-fill: -fx-secondary;
}
.table-row-cell {
    -fx-background-color: -fx-surface;
    -fx-background-radius: 8px;
    -fx-border-radius: 8px;
}
.table-row-cell:selected {
    -fx-background-color: derive(-fx-primary, 80%);
}

/* Píldoras de navegación */
.pill {
    -fx-background-color: transparent;
    -fx-border-color: -fx-secondary;
    -fx-border-radius: 20px;
    -fx-padding: 6 18;
    -fx-text-fill: -fx-secondary;
    -fx-cursor: hand;
}
.pill:selected {
    -fx-background-color: -fx-secondary;
    -fx-text-fill: white;
}

/* Modal / diálogo */
.modal {
    -fx-background-color: white;
    -fx-background-radius: 16px;
    -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 20, 0, 0, 0);
    -fx-padding: 24;
}

/* Reloj */
.clock {
    -fx-font-family: 'Geist Mono', monospace;
    -fx-font-size: 18px;
    -fx-font-weight: bold;
}

/* Drop zone para currículum */
.drop-zone {
    -fx-border-color: dashed #cbd5e1;
    -fx-border-width: 2;
    -fx-border-radius: 16px;
    -fx-background-color: #f8fafc;
    -fx-padding: 40;
}
.drop-zone.drag-over {
    -fx-border-color: -fx-primary;
    -fx-background-color: derive(-fx-primary, 95%);
}

/* Modo oscuro */
.root.dark {
    -fx-bg: #0f172a;
    -fx-surface: rgba(30, 41, 59, 0.8);
    -fx-text: #e2e8f0;
}
```

---

## 12. MODELO DE DATOS EN JAVA FX (Observables)

Para la integración con TableView, crear DTOs con propiedades observables:

```java
public class UsuarioResumenDTO {

    private final SimpleStringProperty id;
    private final SimpleStringProperty nombre;
    private final SimpleStringProperty apellidos;
    private final SimpleObjectProperty<UserSource> source;
    private final SimpleObjectProperty<LocalDate> fechaNacimiento;
    private final SimpleStringProperty localidad;
    private final SimpleObjectProperty<YesNo> insertado;
    private final SimpleStringProperty sector;
    private final SimpleStringProperty empresa;

    // Constructor, getters (PropertyValueFactory-friendly)
    public String getNombreCompleto() { return nombre.get() + " " + apellidos.get(); }
    public StringProperty nombreCompletoProperty() { /* binding */ }
}
```

---

## 13. CLIENTE HTTP

### UsuarioService (JavaFX side)

```java
public class UsuarioService {

    private final String BASE_URL = "http://localhost:8080/api/usuarios";
    private final HttpClient client;

    public UsuarioService() {
        client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public List<UsuarioResumenDTO> listar(String nombre, String apellidos,
                                          AcademicLevel formacion, YesNo experiencia) {
        // Construir URL con query params
        StringBuilder url = new StringBuilder(BASE_URL + "?");
        if (nombre != null && !nombre.isEmpty()) url.append("nombre=").append(URLEncoder.encode(nombre)).append("&");
        if (apellidos != null && !apellidos.isEmpty()) url.append("apellidos=").append(apellidos).append("&");
        // ...

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url.toString()))
                .header("Authorization", "Bearer " + SessionManager.getInstance().getToken())
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
        // Deserializar con Jackson
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper.readValue(response.body(),
                new TypeReference<List<UsuarioResumenDTO>>() {});
    }
}
```

---

## 14. PDF GENERATION (equivalente a jsPDF)

```java
@Service
public class PdfService {

    public byte[] generarFichaUsuario(UsuarioDetalleDTO usuario) {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {
                // Título
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 18);
                cs.newLineAtOffset(50, 750);
                cs.showText("Ficha de Usuario");
                cs.endText();

                // Datos personales
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 12);
                cs.newLineAtOffset(50, 720);
                cs.showText("Nombre: " + usuario.nombre() + " " + usuario.apellidos());
                cs.newLineAtOffset(0, -20);
                cs.showText("Localidad: " + usuario.localidad());
                cs.newLineAtOffset(0, -20);
                cs.showText("Teléfono: " + usuario.telefono1());
                // ...
                cs.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generando PDF", e);
        }
    }
}
```

---

## 15. WEBSOCKET (socket.io echo → Spring WebSocket)

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*");
    }
}
```

En JavaFX, conectar:

```java
public class WebSocketClient {

    private StompSession session;

    public void connect() {
        WebSocketClient transport = new StandardWebSocketClient();
        StompClient stomp = new StompSessionProvider(transport);
        session = stomp.connect("ws://localhost:8080/ws", new StompSessionHandlerAdapter() {}).get();
    }

    public void subscribe(String topic, Consumer<String> callback) {
        session.subscribe(topic, new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) { return String.class; }
            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                Platform.runLater(() -> callback.accept((String) payload));
            }
        });
    }
}
```

---

## 16. ALMACENAMIENTO DE ARCHIVOS

### StorageAdapter (equivalente al patrón actual en lib/storage)

```java
public interface StorageAdapter {
    void store(String fileName, byte[] content);
    byte[] retrieve(String fileName);
    void delete(String fileName);
}

@Component
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageAdapter implements StorageAdapter {
    @Value("${storage.local.path}")
    private String basePath;

    @Override
    public void store(String fileName, byte[] content) {
        Path filePath = Path.of(basePath, fileName);
        Files.createDirectories(filePath.getParent());
        Files.write(filePath, content);
    }

    @Override
    public byte[] retrieve(String fileName) {
        return Files.readAllBytes(Path.of(basePath, fileName));
    }

    @Override
    public void delete(String fileName) {
        Files.deleteIfExists(Path.of(basePath, fileName));
    }
}

@Component
@ConditionalOnProperty(name = "storage.type", havingValue = "s3")
public class S3StorageAdapter implements StorageAdapter {
    // implementar con AWS SDK para Java v2
}
```

### application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/proyectodatabase
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  servlet:
    multipart:
      max-file-size: 5MB

storage:
  type: local
  local:
    path: ./uploads/curriculums

server:
  port: 8080
```

---

## 17. CONFIGURACIÓN DEL BUILD

### pom.xml (Spring Boot + JavaFX)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.0</version>
    </parent>

    <groupId>com.app</groupId>
    <artifactId>gestion-usuarios</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <modules>
        <module>backend</module>
        <module>frontend</module>
    </modules>

    <properties>
        <java.version>21</java.version>
    </properties>
</project>
```

### backend/pom.xml

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt</artifactId>
        <version>0.12.5</version>
    </dependency>
    <dependency>
        <groupId>org.apache.pdfbox</groupId>
        <artifactId>pdfbox</artifactId>
        <version>3.0.3</version>
    </dependency>
    <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>s3</artifactId>
        <version>2.30.0</version>
    </dependency>
</dependencies>
```

### frontend/pom.xml (JavaFX con Maven)

```xml
<dependencies>
    <dependency>
        <groupId>org.openjfx</groupId>
        <artifactId>javafx-controls</artifactId>
        <version>21</version>
    </dependency>
    <dependency>
        <groupId>org.openjfx</groupId>
        <artifactId>javafx-fxml</artifactId>
        <version>21</version>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.datatype</groupId>
        <artifactId>jackson-datatype-jsr310</artifactId>
    </dependency>
</dependencies>
```

---

## 18. ORDEN DE MIGRACIÓN RECOMENDADO

### Fase 1: Backend (Spring Boot)
1. Crear proyecto Spring Boot con Maven/Gradle
2. Configurar `application.yml` y conexión a PostgreSQL
3. Crear enums y entidades JPA
4. Crear repositorios con métodos de consulta
5. Crear DTOs (records)
6. Implementar servicios (UsuarioService, EstadisticasService, CurriculumService, AuthService)
7. Crear controladores REST y probar con Postman/curl
8. Implementar seguridad (Spring Security + JWT)
9. Implementar almacenamiento de archivos
10. Probar todos los endpoints exhaustivamente

### Fase 2: Frontend (JavaFX)
11. Configurar proyecto JavaFX con Maven
12. Crear modelo de datos observable (DTOs con propiedades)
13. Implementar capa HTTP (Java HttpClient o Feign)
14. Crear LoginView + LoginController
15. Crear MainView + MainController (tabla)
16. Implementar búsqueda y filtros
17. Crear UserFormView (stepper multipaso)
18. Validación de formularios en cada paso
19. Crear UserDetailView (tabs)
20. Implementar vistas de diario
21. Crear StatsView (tablas/gráficos)
22. CSS y temas (claro/oscuro)

### Fase 3: Integración y pruebas
23. Probar flujo completo (login → CRUD → PDF → estadísticas)
24. Probar subida/descarga de currículums
25. Verificar manejo de errores en todos los formularios
26. Pruebas de rendimiento con 100+ usuarios en tabla
27. Empaquetar aplicación (`.exe`, `.msi` o `.dmg` con jpackage)

---

## 19. TIPS POR ÁREA

### Formularios y validación (React Hook Form + Zod → JavaFX)
- Usar `TextInputControl.textProperty()` con listeners para validación en tiempo real
- Crear clase `FormValidator<T>` que recibe un `T` y devuelve `Map<String, String>` errores
- Para validación similar a Zod, crear constraints con anotaciones personalizadas + `ValidationSupport` de ControlsFX
- Alternativa: usar `javafx.beans.binding.Bindings` con lógica condicional

### Estado global (Zustand → SessionManager)
```java
public class SessionManager {
    private static final SessionManager INSTANCE = new SessionManager();
    private final StringProperty token = new SimpleStringProperty();
    private final StringProperty username = new SimpleStringProperty();

    public static SessionManager getInstance() { return INSTANCE; }
    // getters, setters, properties
}
```

### Animaciones (framer-motion → JavaFX Animation)
```java
// Fade in
FadeTransition fade = new FadeTransition(Duration.millis(300), node);
fade.setFromValue(0);
fade.setToValue(1);
fade.play();

// Slide
TranslateTransition slide = new TranslateTransition(Duration.millis(300), node);
slide.setFromX(50);
slide.setToX(0);
```

### Tabla ordenable
```java
TableColumn<UsuarioResumenDTO, String> col = new TableColumn<>("Nombre");
col.setSortable(true);
col.setComparator(Comparator.naturalOrder());
table.getSortOrder().add(col);
```

### Notificaciones toast
```java
public static void showToast(String message, Stage owner) {
    Label toast = new Label(message);
    toast.getStyleClass().add("toast");
    // Posicionar y animar
    FadeTransition ft = new FadeTransition(Duration.seconds(3), toast);
    ft.setFromValue(1);
    ft.setToValue(0);
    ft.setOnFinished(e -> ((StackPane)toast.getParent()).getChildren().remove(toast));
    ft.play();
}
```

---

## 20. POSIBLES MEJORAS DURANTE LA MIGRACIÓN

- **Autenticación real**: reemplazar credenciales hardcodeadas por Spring Security con JWT (ya planificado)
- **Roles y usuarios múltiples**: añadir entidad `UsuarioSistema` con roles (ADMIN, EDITOR, VIEWER)
- **Paginación**: añadir `Pageable` de Spring Data a la tabla de usuarios
- **Internacionalización**: `ResourceBundle` para español/inglés
- **Logging**: SLF4J + Logback (incluido en Spring Boot)
- **Testing**: JUnit 5 + Mockito para servicios, TestContainers para BD
- **Gráficos**: JavaFX Charts (`BarChart`, `PieChart`) para estadísticas
- **Exportar a Excel**: Apache POI para descargar listados
- **Dark mode**: JavaFX CSS con `.dark` class toggle en el `Scene` root
