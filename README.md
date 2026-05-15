# ASC Contabilidad - Sistema de Información Contable

Aplicación web CRUD para la base de datos contable de la **Maestría en Contabilidad - Universidad del Atlántico**.

## Stack tecnológico
- **Backend:** Node.js + Express
- **Plantillas:** EJS + Bootstrap 5
- **Base de datos:** MySQL 8.0 (Railway plugin)
- **Tablas:** 8 módulos (cuentas, centros de costo, terceros, empleados, comprobantes, movimientos, presupuesto, auditoría)

---

## Despliegue en Railway

### Paso 1 — Crear proyecto en Railway
1. Ir a [railway.app](https://railway.app) → **New Project**
2. Elegir **Deploy from GitHub repo** y conectar este repositorio
3. Railway detecta automáticamente Node.js y usa `node app.js` como comando de inicio

### Paso 2 — Agregar MySQL
1. En el proyecto de Railway → **+ New** → **Database** → **MySQL**
2. Railway crea el servicio y expone las variables `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE` **automáticamente** en el servicio de la app

### Paso 3 — Variables de entorno
En el servicio de la app → **Variables** → agregar:

| Variable         | Valor                             |
|-----------------|-----------------------------------|
| `SESSION_SECRET` | una cadena aleatoria larga        |
| `ADMIN_USER`     | admin (o el usuario que desees)   |
| `ADMIN_PASSWORD` | contraseña segura                 |

> Las variables `MYSQL*` las inyecta Railway automáticamente desde el plugin MySQL.

### Paso 4 — Cargar el esquema SQL
Conectarse a la base de datos de Railway con un cliente MySQL (DBeaver, MySQL Workbench) usando las credenciales del plugin y ejecutar el script SQL del curso completo.

### Paso 5 — Deploy
Railway despliega automáticamente al hacer push a la rama principal. La app estará disponible en la URL pública que Railway asigna.

---

## Desarrollo local

```bash
# 1. Clonar o descomprimir el proyecto
cd contabilidad-ua

# 2. Instalar dependencias
npm install

# 3. Copiar y configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales de tu MySQL local

# 4. Iniciar en modo desarrollo
npm run dev

# La app corre en http://localhost:3000
```

### Credenciales por defecto (desarrollo)
- Usuario: `admin`
- Contraseña: `admin2024`  
*(cambiar en producción via variables de entorno)*

---

## Módulos CRUD disponibles

| Módulo           | URL              | Operaciones        |
|-----------------|------------------|--------------------|
| Plan de Cuentas | `/cuentas`       | Crear, editar, eliminar, consultar |
| Centros de Costo| `/centros-costo` | Crear, editar, eliminar, consultar |
| Terceros        | `/terceros`      | Crear, editar, eliminar, consultar |
| Empleados       | `/empleados`     | Crear, editar, eliminar, consultar |
| Comprobantes    | `/comprobantes`  | Crear, editar, eliminar, consultar |
| Movimientos     | `/movimientos`   | Crear, editar, eliminar, consultar |
| Presupuesto     | `/presupuesto`   | Crear, editar, eliminar, consultar |
| Auditoría       | `/auditoria`     | Solo consulta (read-only)          |
