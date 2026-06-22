# Seguridad Hito 3 - SSP-UXLab

## Estado Actual

El 20 de junio de 2026 se fortaleció la seguridad del MVP para que la
separación por cuenta no dependa solamente de un `proyecto_id` almacenado en el
navegador.

El flujo actual es:

```text
Supabase Auth -> JWT -> Next.js -> FastAPI -> rol authenticated -> RLS -> PostgreSQL
```

FastAPI valida el token con Supabase Auth y configura el `auth.uid()` de la
solicitud antes de ejecutar consultas. Aunque la conexión técnica se abre con
el rol de backend, las operaciones funcionales cambian al rol PostgreSQL
`authenticated`, que no posee `BYPASSRLS`.

## Controles Implementados

### Autenticación y autorización

- Registro e inicio de sesión con correo y contraseña mediante Supabase Auth.
- Sesión y renovación de token administradas por el cliente oficial de Supabase.
- JWT enviado como `Authorization: Bearer` en las llamadas a FastAPI.
- Validación del JWT en el backend mediante el endpoint de usuario de Supabase.
- La ruta de acceso local sin backend fue eliminada.
- El correo enviado al perfil debe coincidir con el correo autenticado.

### Row Level Security

- Se agregó `usuario.auth_user_id` como vínculo con `auth.users`.
- RLS está habilitado en:
  - `usuario`
  - `proyecto`
  - `registro_etapa`
  - `investigacion`
  - `persona_usuaria`
  - `habilitacion`
  - `expectativa`
  - `necesidad`
  - `vinculacion`
  - `indicador`
  - `momento_critico`
  - `calendarizacion_actividad`
  - `evidencia`
- Las políticas permiten al rol `authenticated` operar solamente sobre el
  proyecto asociado a su identidad.
- Se revocaron privilegios generales y se conservaron únicamente `SELECT`,
  `INSERT`, `UPDATE` y `DELETE` para el rol funcional.
- `usuario` y `registro_etapa`, que anteriormente no tenían políticas, quedaron
  cubiertas.

Prueba transaccional realizada:

- Identidad propietaria: puede visualizar su proyecto.
- Identidad UUID ajena: visualiza `0` proyectos y `0` registros.
- La preparación temporal usada para la prueba se revirtió al terminar.

### Logs y errores

- Se agregó un identificador único por solicitud.
- Los logs registran evento, ruta, estado e identificador técnico.
- No se registran cuerpos de formularios, contraseñas, JWT, claves, cadenas de
  conexión ni descripciones metodológicas.
- Se sanitizan saltos de línea para reducir riesgo de inyección en logs.
- Los errores inesperados entregan un mensaje genérico y un `request_id`.
- Los mensajes internos de Supabase Storage ya no se devuelven al navegador.

### Cifrado y transporte

- Se incorporó AES-256-GCM autenticado para:
  - `calendarizacion_actividad.observaciones`
  - `evidencia.descripcion`
- El formato usa prefijo versionado `enc:v1:` y nonce aleatorio por dato.
- Los datos históricos en texto plano siguen siendo legibles.
- La activación requiere `DATA_ENCRYPTION_KEY`, una clave base64 de 32 bytes
  almacenada únicamente como secreto del backend.
- La conexión PostgreSQL exige TLS. La validación completa de certificado puede
  activarse con `DATABASE_SSL_VERIFY=true` cuando se disponga de una CA
  compatible con el pooler.

### Archivos y navegador

- Límite de archivo: 10 MB.
- Se permiten PDF, documentos de oficina, imágenes rasterizadas, TXT y CSV.
- Se bloquean HTML, SVG y JavaScript para evitar contenido activo.
- Las nuevas evidencias usan URL firmada salvo configuración pública explícita.
- Se agregaron CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
  Referrer Policy y Permissions Policy.
- CORS acepta únicamente orígenes, métodos y cabeceras definidos.
- `/db-test` está deshabilitado por defecto.

### Dependencias

- Next.js fue actualizado de `16.2.4` a `16.2.9`.
- PostCSS fue fijado en `8.5.12`.
- `npm audit --omit=dev` finalizó con `0` vulnerabilidades de producción.

## Variables Requeridas

Frontend:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=CLAVE_PUBLICABLE
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Backend:

```env
SUPABASE_URL=https://TU_PROYECTO.supabase.co
# Opcional si el backend ya tiene SUPABASE_SERVICE_ROLE_KEY:
SUPABASE_ANON_KEY=CLAVE_PUBLICABLE
DATA_ENCRYPTION_KEY=CLAVE_BASE64_DE_32_BYTES
DATABASE_SSL_VERIFY=false
ENABLE_DIAGNOSTIC_ENDPOINTS=false
```

La clave `SUPABASE_SERVICE_ROLE_KEY` continúa siendo exclusiva del backend para
Supabase Storage y nunca debe exponerse al navegador.

## Verificación Ejecutada

- `npx.cmd tsc --noEmit`: correcto.
- `npm.cmd run build`: correcto con Next.js 16.2.9.
- Compilación Python: correcta.
- `/health`: HTTP 200.
- Recurso protegido sin token: HTTP 401.
- Recurso protegido con token inválido: HTTP 401.
- Cabeceras `nosniff` y anti-frame: presentes.
- Prueba AES-256-GCM: cifrado, descifrado y compatibilidad con texto histórico
  correctos.
- Auditoría de dependencias productivas: 0 vulnerabilidades.

## Pendientes Controlados

- Configurar `DATA_ENCRYPTION_KEY` en Render antes del despliegue. El backend
  puede reutilizar su `SUPABASE_SERVICE_ROLE_KEY` exclusivamente del lado
  servidor para validar sesiones si no se define `SUPABASE_ANON_KEY`.
- Probar registro, confirmación de correo e inicio de sesión en producción.
- Definir rotación y recuperación de la clave AES.
- Migrar gradualmente texto histórico si UXLab exige cifrado retroactivo.
- Incorporar una tabla de membresías si más de una persona debe colaborar en un
  mismo proyecto.
- Configurar verificación completa del certificado PostgreSQL.
- Centralizar logs y definir retención, consulta y alertas.
