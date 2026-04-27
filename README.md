# Catálogo Digital para Distribuidora Molinero

Versión de catálogo sin precios, preparada para una distribuidora.

## Qué incluye

- Logo de Distribuidora Molinero en el encabezado.
- Productos organizados por marca con título por marca.
- 864 productos cargados.
- Nuevas tinturas agregadas por marca: FITHOCOLOR, OTOWIL, COLORMASTER y TONALEG.
- Últimos productos agregados: OTOWIL, MABELL ROMMER, EMYNENT, DORCO y ROJO+ROJO.
- Buscador por producto o marca.
- Carrito de pedido con cantidades.
- Datos del cliente.
- PDF del pedido sin precios.
- Botón para enviar el pedido por WhatsApp.

## Limpieza aplicada

Se quitaron los productos indicados:

- NON AMMONIA.
- PRIMONT sin amoníaco.
- Carta de colores.
- Tinturas de Mary Bosques.
- Tintura Caviar.

Total de productos quitados: 22.

## Marcas cargadas

- CAVIAR: 24 productos
- COLORMASTER: 127 productos
- DERMOGREEN: 59 productos
- DORCO: 1 productos
- EMYNENT: 4 productos
- FIDELITÉ: 58 productos
- FITHOCOLOR: 57 productos
- MABELL ROMMER: 9 productos
- MARY BOSQUES: 176 productos
- OTOWIL: 80 productos
- PRIMONT PROFESSIONAL: 150 productos
- ROJO+ROJO: 1 productos
- SCOTLAND: 7 productos
- STYLEMAKERS: 2 productos
- TONALEG: 109 productos
<!-- - VARIOS: 2 productos -->

## Importante sobre las imágenes

Las tinturas nuevas tienen imágenes generadas para catálogo con marca, código/tono y referencia visual de color. No son fotos comerciales reales del envase.
Cuando tengas fotos reales, se pueden reemplazar dentro de `public/productos` y actualizar `src/products.js`.

## Cómo ejecutar

1. Abrí la carpeta del proyecto en Visual Studio Code.
2. Instalá dependencias:

```bash
npm install
```

3. Ejecutá el proyecto:

```bash
npm run dev
```

4. Entrá a la URL que muestre Vite, normalmente:

```bash
http://localhost:5173
```

## Cambiar número de WhatsApp

Editá este archivo:

```txt
src/config.js
```

Y cambiá:

```js
telefonoWhatsApp: '5492640000000'
```

Formato recomendado para Argentina:

```txt
549 + característica + número
```

Ejemplo ficticio:

```txt
5492641234567
```

## Cambiar productos

Editá este archivo:

```txt
src/products.js
```

Ejemplo:

```js
{
  id: 1,
  marca: 'FIDELITÉ',
  categoria: 'SHAMPOO',
  nombre: 'Shampoo Keratina 900ml',
  imagen: '/productos/marca-fidelite.svg',
}
```

## Próxima etapa recomendada

- Revisar si querés que Tonaleg vaya por tonos individuales o como producto general “tonos a elección”.
- Reemplazar imágenes generadas por fotos reales del envase.
- Panel administrador para cargar productos desde la web.
- Base de datos.
- Historial de pedidos.
