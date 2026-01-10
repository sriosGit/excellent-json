# Excellent JSON

Convierte archivos Excel a JSON con estructura personalizada usando drag and drop.

## Características

- **Carga de archivos**: Soporta `.xlsx`, `.xls` y `.csv`
- **Dos modos de exportación**:
  - **Array**: `[{ campo1: valor1, ... }]`
  - **Hash**: `{ "key": { campo1: valor1, ... } }` - usa una columna como key
- **Estructura personalizable**:
  - Renombra campos (doble click o botón de editar)
  - Crea grupos anidados para estructuras complejas
  - Drag and drop para organizar campos
- **Preview en tiempo real**: Ve cómo queda tu JSON mientras construyes
- **Privacidad**: Todo se procesa en tu navegador, nada se envía a ningún servidor

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Uso

1. Arrastra o selecciona tu archivo Excel
2. Elige el formato de salida (Array o Hash)
3. Arrastra los campos al área de construcción
4. Renombra campos según necesites
5. Crea grupos para estructuras anidadas
6. Copia o descarga el JSON resultante

## Ejemplo

### Excel de entrada

| dni    | nombre | apellido |
|--------|--------|----------|
| 400440 | Juan   | Ramirez  |
| 500550 | Maria  | Lopez    |

### Modo Array

```json
[
  {
    "dni": "400440",
    "nombre": "Juan",
    "apellido": "Ramirez"
  }
]
```

### Modo Hash (usando `dni` como key)

```json
{
  "400440": {
    "nombre": "Juan",
    "apellido": "Ramirez"
  }
}
```

### Con estructura anidada

```json
{
  "400440": {
    "nombre_completo": {
      "first_name": "Juan",
      "last_name": "Ramirez"
    }
  }
}
```

## Stack Tecnológico

- React 18 + TypeScript
- Vite
- Tailwind CSS
- SheetJS (xlsx) - lectura de Excel
- @dnd-kit - drag and drop
- Zustand - estado global

## Scripts

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Preview de la build de producción
