# 💼 Plataforma de Gestión de Activos e Incidencias Empresariales

**Proyecto Full Stack para la administración eficiente de dispositivos tecnológicos, licencias y gestión de incidencias en entornos empresariales.**

---

## 📌 Descripción General

Esta plataforma web y móvil permite a empresas gestionar de forma integral sus **activos tecnológicos** (ordenadores, móviles, pantallas, etc.) y las **incidencias** que puedan surgir, con una interfaz intuitiva y roles claramente definidos.

> 🚀 Optimizado para eficiencia, escalabilidad y facilidad de uso tanto en el entorno técnico como administrativo.

---

## 🎯 Objetivos del Proyecto

- Centralizar la gestión de dispositivos tecnológicos.
- Automatizar el control de licencias y credenciales.
- Facilitar el seguimiento y resolución de incidencias.
- Integrar sistemas externos vía API.
- Proveer estadísticas y reportes para la toma de decisiones.

---

## 👥 Roles y Funcionalidades

### 👑 Administrador
- Crear, editar y eliminar usuarios.
- Asignar roles.
- Gestionar todo el inventario.
- Control total sobre licencias.
- Acceder a estadísticas avanzadas.
- Configurar reglas de asignación automática de incidencias.
- Revisar logs de actividad y auditoría.

### 🛠️ Técnico
- Visualizar dispositivos por usuario.
- Resolver incidencias (actualización, cierre).
- Actualizar software y hardware.
- Consultar estadísticas y tiempos de resolución.

### 🙋 Usuario Normal
- Ver sus dispositivos asignados.
- Reportar y seguir incidencias.
- Acceder a manuales y documentación técnica.

---

## 📲 Aplicaciones

### 🌐 Plataforma Web (Administradores y Técnicos)
- Login seguro.
- Dashboard personalizable por rol.
- Gestión avanzada de dispositivos, incidencias y licencias.
- Escaneo QR para acceder a la ficha del dispositivo.
- Exportación de datos en PDF/Excel.

### 📱 App Móvil (Usuarios)
- Login con autenticación segura.
- Consulta de dispositivos asignados.
- Escaneo QR y reporte de incidencias con fotos.
- Seguimiento en tiempo real.
- Centro de ayuda y notificaciones.

---

## 🎨 Indicadores Visuales

- **Dispositivos**
  - 🟢 Operativo
  - 🟡 Mantenimiento
  - 🔴 Averiado

- **Licencias**
  - 🟢 Vigente
  - 🟡 Próxima a caducar
  - 🔴 Caducada

---

## 📷 Código QR por Dispositivo

Cada dispositivo tiene un código QR único que permite:

- Ver detalles del dispositivo
- Consultar incidencias relacionadas
- Comprobar estado y licencias vigentes

---

## 🗄️ Estructura de la Base de Datos (Resumen)

- **Usuarios**: nombre, email, contraseña, rol
- **Dispositivos**: tipo, serie, marca, estado, usuario asignado
- **Componentes**: tipo, descripción, specs
- **Software**: tipo, versión, dispositivo
- **Licencias**: clave, inicio, expiración
- **Credenciales remotas**: AnyDesk y claves cifradas
- **Incidencias**: título, descripción, estado, técnico asignado

---

## 🧠 Tecnología Utilizada

### 🔙 Backend
- **Strapi (Node.js)**
- **Base de Datos: MySQL**
- Autenticación: JWT + OAuth 2.0

### 🌐 Frontend Web
- **React.js** + **Vite**
- **Material UI** o **Ant Design**

### 📱 App Móvil
- **React Native** + **Expo**
- Notificaciones Push y soporte multiplataforma

### ⚙️ Infraestructura y DevOps
- **Docker** para backend
- **Vercel/Netlify** para frontend
- **Firebase** para app móvil
- **GitHub Actions** para CI/CD

---

## 📈 Funcionalidades Avanzadas

- 🔐 **Seguridad**: Hashing de contraseñas, autenticación por roles, cifrado de datos sensibles.
- 📦 **Escalabilidad**: Preparada para grandes volúmenes de datos.
- 🔄 **Automatización**: Alertas de licencias, asignación de incidencias.
- 📡 **Integración**: API REST/GraphQL para conexión con ERPs u otros sistemas.
- 📂 **Documentación adjunta**: Manuales, imágenes, PDF por dispositivo o incidencia.
- 🧾 **Reportes y estadísticas**: Exportables, detallados, filtrables.

---

## 🔧 Flujo de Desarrollo

1. Definición de esquemas en Strapi.
2. Creación de endpoints REST o GraphQL.
3. Desarrollo frontend web (React).
4. Desarrollo app móvil (React Native).
5. Pruebas unitarias y de integración.
6. Despliegue automatizado.
7. Monitoreo continuo.

---

## 📎 Capturas de Pantalla

> *(Asegúrate de añadir capturas de pantalla en tu repo de GitHub aquí)*

---

## 📚 Futuras Mejoras

- Soporte multilenguaje.
- Exportación automática de informes por email.
- Implementación de IA para predicción de fallos frecuentes.
- Chat de soporte integrado.

---

## 🤝 Contribuciones

¡Toda ayuda es bienvenida! Si deseas colaborar, por favor haz un fork y envía un PR.

---

## 🧑‍💻 Autor

Desarrollado por **Iñaki Borrego Bau**  
📫 *iborrego@delfrom.com*  
🌐 *https://www.linkedin.com/in/i%C3%B1aki-borrego-bau-85aab715b/*

---

## 📝 Licencia

MIT License. Consulta el archivo [LICENSE](./LICENSE) para más detalles.
