# 🍽 SIGR — Sistema Integral de Gestión de Restaurante

Sistema web para gestionar pedidos, reservas, menú digital, control de caja y generación de reportes, con inteligencia artificial integrada (Claude AI).

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm v9 o superior
- Una API Key de [Anthropic](https://console.anthropic.com/) (para las funciones de IA)

---

## Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/sigr.git
cd sigr
```

---

## Instalación

```bash
npm install
```

---

## Configuración

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx
```

> ⚠️ Nunca subas tu archivo `.env` al repositorio. Ya está incluido en `.gitignore`.

---

## Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

---

## Construir para producción

```bash
npm run build
```

Los archivos compilados quedarán en la carpeta `dist/`.

Para previsualizar la build de producción:

```bash
npm run preview
```

---

## Estructura del proyecto

```
sigr/
├── src/
│   ├── SIGR.jsx          # Componente principal (app completa)
│   └── main.jsx          # Punto de entrada React
├── public/
├── .env                  # Variables de entorno (no versionar)
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── CHANGELOG.md
└── LICENSE.txt
```

---

## Credenciales de acceso (demo)

| Rol      | Usuario    | Contraseña |
|----------|------------|------------|
| Admin    | Admin      | admin123   |
| Mesero   | Luis Pérez | mesero1    |
| Mesero   | Ana Torres | mesero2    |

---

## Módulos disponibles

| Módulo              | Admin | Mesero |
|---------------------|:-----:|:------:|
| Dashboard           | ✅    | ✅     |
| Pedidos en tiempo real | ✅ | ✅     |
| Menú digital        | ✅    | ✅     |
| Reservas            | ✅    | ✅     |
| Caja y reportes     | ✅    | ❌     |

---

## Tecnologías utilizadas

- **React 18** — interfaz de usuario
- **Vite** — bundler y servidor de desarrollo
- **Claude API (Anthropic)** — inteligencia artificial integrada
- **CSS-in-JS** — estilos inline con sistema de tokens propio

---

## Licencia

Este proyecto está licenciado bajo los términos de la **MIT License**. Ver [`LICENSE.txt`](./LICENSE.txt) para más detalles.
