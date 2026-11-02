# Práctica 4 — Información nutricional

Actividades 4.1, 4.2 y 4.3: documento XML, esquema XML Schema (XSD) y hoja de estilo XSLT para mostrar la información nutricional de un paquete de galletas **Grandma White**.

## Archivos

| Archivo | Descripción |
|---|---|
| `nutrición.xml` | Documento XML con la información nutricional del producto. |
| `nutrition.xml` | Esquema XML Schema (XSD) que define y valida la estructura del XML. |
| `nutricion.xsl` | Hoja de estilo XSLT que transforma el XML en una tabla HTML5. |
| `README.md` | Este documento con la descripción y las instrucciones de uso. |

## Datos incluidos

El documento considera una porción de **1 paquete** con los siguientes valores:

| Información nutricional | Cantidad |
|---|---:|
| Calorías | 260 kcal |
| Calorías de grasa | 100 kcal |
| Grasa total | 11 g |
| Grasa saturada | 2 g |
| Colesterol | 5 mg |
| Sodio | 210 mg |
| Carbohidratos totales | 36 g |
| Fibra | 2 g |
| Azúcares | 15 g |
| Proteína | 5 g |

## Estructura del XML

El elemento raíz es `nutricion` y contiene tres secciones principales:

- `producto`: nombre del producto.
- `tamanoPorcion`: cantidad y unidad de la porción.
- `informacionNutricional`: lista de nutrientes y sus cantidades.

Los nutrientes que se expresan en gramos o miligramos utilizan el atributo `unidad`:

```xml
<grasaTotal unidad="g">11</grasaTotal>
<colesterol unidad="mg">5</colesterol>
```

El documento está asociado al esquema y a la hoja de estilo mediante las siguientes instrucciones:

```xml
<?xml-stylesheet type="text/xsl" href="nutricion.xsl"?>
...
xsi:noNamespaceSchemaLocation="nutrition.xml"
```

## Cómo visualizarlo

1. Abre el archivo `nutrición.xml` con un navegador web como Edge, Chrome o Firefox.
2. El navegador aplicará automáticamente `nutricion.xsl` y mostrará la información en una tabla HTML5.

Si el navegador no aplica la hoja de estilo debido a restricciones para archivos locales, utiliza un servidor local. Por ejemplo, desde VS Code puedes usar la extensión **Live Server** o ejecutar un servidor HTTP en esta carpeta y abrir `nutrición.xml` desde `http://localhost:8000/nutrición.xml`.

## Validación

El documento XML fue validado contra el esquema `nutrition.xml` y la transformación XSLT se ejecutó correctamente, generando una tabla HTML5 con todos los datos nutricionales.

## Nota

El nombre del producto se escribió como **Grandma White**, ya que el texto original de la actividad parece contener un error tipográfico en la palabra «Whitc».
