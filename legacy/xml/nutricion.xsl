<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output method="html" version="5.0" encoding="UTF-8"
                indent="yes"/>

    <xsl:template match="/">
        <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <title>Información nutricional - <xsl:value-of select="nutricion/producto"/></title>
                <style>
                    :root {
                        color-scheme: light;
                        --borde: #222;
                        --fondo-suave: #f3f4f6;
                        --azul: #174a7c;
                    }

                    * {
                        box-sizing: border-box;
                    }

                    body {
                        margin: 0;
                        min-height: 100vh;
                        padding: 2rem 1rem;
                        background: #e9edf2;
                        color: #1d1d1d;
                        font-family: Arial, Helvetica, sans-serif;
                    }

                    main {
                        max-width: 620px;
                        margin: 0 auto;
                        padding: 1.5rem;
                        background: #fff;
                        border-top: 10px solid var(--borde);
                        box-shadow: 0 12px 30px rgb(0 0 0 / 12%);
                    }

                    h1 {
                        margin: 0;
                        font-size: 1.9rem;
                        line-height: 1.15;
                    }

                    .porcion {
                        margin: 0.75rem 0 1.25rem;
                        padding-bottom: 0.75rem;
                        border-bottom: 8px solid var(--borde);
                        font-size: 1rem;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 1rem;
                    }

                    caption {
                        padding: 0 0 0.65rem;
                        color: var(--azul);
                        font-size: 1.15rem;
                        font-weight: 700;
                        text-align: left;
                    }

                    thead th {
                        padding: 0.6rem 0.4rem;
                        border-bottom: 3px solid var(--borde);
                        text-align: left;
                    }

                    thead th:last-child {
                        text-align: right;
                    }

                    tbody th,
                    tbody td {
                        padding: 0.55rem 0.4rem;
                        border-bottom: 1px solid #c7c9cc;
                        font-weight: 400;
                    }

                    tbody th {
                        text-align: left;
                    }

                    tbody td {
                        width: 38%;
                        text-align: right;
                        font-variant-numeric: tabular-nums;
                        white-space: nowrap;
                    }

                    tbody tr.destacado th,
                    tbody tr.destacado td {
                        font-size: 1.15rem;
                        font-weight: 700;
                    }

                    tbody tr.subrayado th,
                    tbody tr.subrayado td {
                        padding-left: 1.4rem;
                    }

                    tbody tr:last-child th,
                    tbody tr:last-child td {
                        border-bottom: 8px solid var(--borde);
                    }

                    .nota {
                        margin: 1rem 0 0;
                        color: #555;
                        font-size: 0.8rem;
                        line-height: 1.4;
                    }

                    @media (max-width: 480px) {
                        main {
                            padding: 1rem;
                        }

                        h1 {
                            font-size: 1.5rem;
                        }
                    }
                </style>
            </head>
            <body>
                <main>
                    <h1><xsl:value-of select="nutricion/producto"/></h1>

                    <p class="porcion">
                        <strong>Tamaño de la porción:</strong>
                        <xsl:value-of select="nutricion/tamanoPorcion/cantidad"/>
                        <xsl:text> </xsl:text>
                        <xsl:value-of select="nutricion/tamanoPorcion/unidad"/>
                    </p>

                    <table>
                        <caption>Información nutricional por porción</caption>
                        <thead>
                            <tr>
                                <th scope="col">Nutriente</th>
                                <th scope="col">Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="destacado">
                                <th scope="row">Calorías</th>
                                <td><xsl:value-of select="nutricion/informacionNutricional/calorias"/> kcal</td>
                            </tr>
                            <tr class="subrayado">
                                <th scope="row">Calorías de grasa</th>
                                <td><xsl:value-of select="nutricion/informacionNutricional/caloriasDeGrasa"/> kcal</td>
                            </tr>
                            <tr>
                                <th scope="row">Grasa total</th>
                                <td><xsl:value-of select="nutricion/informacionNutricional/grasaTotal"/> <xsl:value-of select="nutricion/informacionNutricional/grasaTotal/@unidad"/></td>
                            </tr>
                            <tr>
                                <th scope="row">Grasa saturada</th>
                                <td><xsl:value-of select="nutricion/informacionNutricional/grasaSaturada"/> <xsl:value-of select="nutricion/informacionNutricional/grasaSaturada/@unidad"/></td>
                            </tr>
                            <tr>
                                <th scope="row">Colesterol</th>
                                <td><xsl:value-of select="nutricion/informacionNutricional/colesterol"/> <xsl:value-of select="nutricion/informacionNutricional/colesterol/@unidad"/></td>
                            </tr>
                            <tr>
                                <th scope="row">Sodio</th>
                                <td><xsl:value-of select="nutricion/informacionNutricional/sodio"/> <xsl:value-of select="nutricion/informacionNutricional/sodio/@unidad"/></td>
                            </tr>
                            <tr>
                                <th scope="row">Carbohidratos totales</th>
                                <td><xsl:value-of select="nutricion/informacionNutricional/carbohidratosTotales"/> <xsl:value-of select="nutricion/informacionNutricional/carbohidratosTotales/@unidad"/></td>
                            </tr>
                            <tr>
                                <th scope="row">Fibra</th>
                                <td><xsl:value-of select="nutricion/informacionNutricional/fibra"/> <xsl:value-of select="nutricion/informacionNutricional/fibra/@unidad"/></td>
                            </tr>
                            <tr>
                                <th scope="row">Azúcares</th>
                                <td><xsl:value-of select="nutricion/informacionNutricional/azucares"/> <xsl:value-of select="nutricion/informacionNutricional/azucares/@unidad"/></td>
                            </tr>
                            <tr>
                                <th scope="row">Proteína</th>
                                <td><xsl:value-of select="nutricion/informacionNutricional/proteina"/> <xsl:value-of select="nutricion/informacionNutricional/proteina/@unidad"/></td>
                            </tr>
                        </tbody>
                    </table>

                    <p class="nota">
                        Información correspondiente a una porción de
                        <xsl:value-of select="nutricion/tamanoPorcion/cantidad"/>
                        <xsl:text> </xsl:text>
                        <xsl:value-of select="nutricion/tamanoPorcion/unidad"/>.
                    </p>
                </main>
            </body>
        </html>
    </xsl:template>

</xsl:stylesheet>
