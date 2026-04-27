import { useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import { productosIniciales } from './products.js'
import { DISTRIBUIDORA } from './config.js'

function normalizarTexto(texto) {
  return texto
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function App() {
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState([])
  const [cliente, setCliente] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    observacion: '',
  })

  const productosFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda.trim())
    if (!texto) return productosIniciales

    return productosIniciales.filter((producto) => {
      const contenido = normalizarTexto(`${producto.marca} ${producto.categoria || ''} ${producto.nombre}`)
      return contenido.includes(texto)
    })
  }, [busqueda])

  const productosPorMarca = useMemo(() => {
    return productosFiltrados.reduce((grupos, producto) => {
      if (!grupos[producto.marca]) grupos[producto.marca] = []
      grupos[producto.marca].push(producto)
      return grupos
    }, {})
  }, [productosFiltrados])

  const totalProductos = productosIniciales.length
  const totalMarcas = new Set(productosIniciales.map((producto) => producto.marca)).size

  function agregarProducto(producto) {
    setCarrito((actual) => {
      const existe = actual.find((item) => item.id === producto.id)
      if (existe) {
        return actual.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        )
      }
      return [...actual, { ...producto, cantidad: 1 }]
    })
  }

  function cambiarCantidad(id, nuevaCantidad) {
    const cantidad = Number(nuevaCantidad)
    if (cantidad <= 0) {
      quitarProducto(id)
      return
    }

    setCarrito((actual) =>
      actual.map((item) => (item.id === id ? { ...item, cantidad } : item)),
    )
  }

  function quitarProducto(id) {
    setCarrito((actual) => actual.filter((item) => item.id !== id))
  }

  function limpiarPedido() {
    setCarrito([])
    setCliente({ nombre: '', telefono: '', direccion: '', observacion: '' })
  }

  async function obtenerImagenBase64(url) {
    try {
      const respuesta = await fetch(url)
      const blob = await respuesta.blob()

      return await new Promise((resolve, reject) => {
        const lector = new FileReader()
        lector.onloadend = () => resolve(lector.result)
        lector.onerror = reject
        lector.readAsDataURL(blob)
      })
    } catch {
      return null
    }
  }

  async function crearPDF() {
    if (carrito.length === 0) {
      alert('Agregá productos al pedido antes de generar el PDF.')
      return null
    }

    const doc = new jsPDF()
    const fecha = new Date().toLocaleString('es-AR')
    const logo = await obtenerImagenBase64(DISTRIBUIDORA.logo)

    if (logo) {
      doc.addImage(logo, 'JPEG', 14, 10, 24, 24)
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text(DISTRIBUIDORA.nombre, logo ? 44 : 14, 20)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(`Pedido generado: ${fecha}`, logo ? 44 : 14, 29)
    doc.text(`Dirección: ${DISTRIBUIDORA.direccion}`, 14, 42)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('Datos del cliente', 14, 56)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(`Nombre: ${cliente.nombre || '-'}`, 14, 66)
    doc.text(`Teléfono: ${cliente.telefono || '-'}`, 14, 73)
    doc.text(`Dirección: ${cliente.direccion || '-'}`, 14, 80)
    doc.text(`Observación: ${cliente.observacion || '-'}`, 14, 87)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('Productos solicitados', 14, 103)

    let y = 115
    doc.setFontSize(10)
    doc.text('Marca', 14, y)
    doc.text('Producto', 48, y)
    doc.text('Cantidad', 166, y)
    y += 7

    doc.setFont('helvetica', 'normal')
    carrito.forEach((item) => {
      const nombreLineas = doc.splitTextToSize(item.nombre, 105)
      const alto = Math.max(7, nombreLineas.length * 5)

      if (y + alto > 276) {
        doc.addPage()
        y = 20
      }

      doc.setFont('helvetica', 'bold')
      doc.text(item.marca, 14, y)
      doc.setFont('helvetica', 'normal')
      doc.text(nombreLineas, 48, y)
      doc.text(String(item.cantidad), 172, y)
      y += alto + 3
    })

    return doc
  }

  async function descargarPDF() {
    const doc = await crearPDF()
    if (!doc) return

    const nombreCliente = cliente.nombre.trim() || 'cliente'
    doc.save(`pedido-${nombreCliente}.pdf`)
  }

  function enviarPorWhatsApp() {
    if (carrito.length === 0) {
      alert('Agregá productos al pedido antes de enviarlo.')
      return
    }

    const lineasProductos = carrito
      .map((item) => `• ${item.marca} - ${item.nombre} x${item.cantidad}`)
      .join('\n')

    const mensaje = `Hola, quiero realizar este pedido:\n\n` +
      `Cliente: ${cliente.nombre || '-'}\n` +
      `Teléfono: ${cliente.telefono || '-'}\n` +
      `Dirección: ${cliente.direccion || '-'}\n\n` +
      `Productos:\n${lineasProductos}\n\n` +
      `Observación: ${cliente.observacion || '-'}`

    const url = `https://wa.me/${DISTRIBUIDORA.telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')
  }

  return (
    <main className="app">
      <header className="hero">
        <div className="hero-brand">
          <img className="logo" src={DISTRIBUIDORA.logo} alt={DISTRIBUIDORA.nombre} />
          <div>
            <p className="eyebrow">Catálogo digital</p>
            <h1>{DISTRIBUIDORA.nombre}</h1>
            <p className="hero-text">
              Elegí productos, armá el pedido y envialo por WhatsApp.
            </p>
          </div>
        </div>
        <div className="hero-card">
          <strong>{carrito.length}</strong>
          <span>productos en pedido</span>
        </div>
      </header>

      <section className="layout">
        <section className="catalogo">
          <div className="section-header">
            <div>
              <h2>Productos</h2>
              <p>{totalProductos} productos cargados, organizados por {totalMarcas} marcas.</p>
            </div>
            <input
              type="search"
              placeholder="Buscar producto o marca..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {Object.entries(productosPorMarca).length === 0 ? (
            <p className="vacio">No se encontraron productos con esa búsqueda.</p>
          ) : (
            Object.entries(productosPorMarca).map(([marca, productos]) => (
              <section className="marca-section" key={marca}>
                <div className="marca-header">
                  <div>
                    <span>Marca</span>
                    <h2>{marca}</h2>
                  </div>
                  <strong>{productos.length} productos</strong>
                </div>

                <div className="productos-grid">
                  {productos.map((producto) => (
                    <article className="producto-card" key={producto.id}>
                      <img src={producto.imagen} alt={producto.nombre} />
                      <p className="producto-marca">{producto.marca}</p>
                      <h3>{producto.nombre}</h3>
                      <button onClick={() => agregarProducto(producto)}>
                        Agregar al pedido
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </section>

        <aside className="pedido-panel">
          <h2>Pedido</h2>

          {carrito.length === 0 ? (
            <p className="vacio">Todavía no agregaste productos.</p>
          ) : (
            <div className="items">
              {carrito.map((item) => (
                <div className="pedido-item" key={item.id}>
                  <div>
                    <span>{item.marca}</span>
                    <strong>{item.nombre}</strong>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => cambiarCantidad(item.id, e.target.value)}
                  />
                  <button className="btn-icon" onClick={() => quitarProducto(item.id)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="cliente-form">
            <h3>Datos del cliente</h3>
            <input
              placeholder="Nombre y apellido"
              value={cliente.nombre}
              onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
            />
            <input
              placeholder="Teléfono"
              value={cliente.telefono}
              onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
            />
            <input
              placeholder="Dirección / zona"
              value={cliente.direccion}
              onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
            />
            <textarea
              placeholder="Observación"
              value={cliente.observacion}
              onChange={(e) => setCliente({ ...cliente, observacion: e.target.value })}
            />
          </div>

          <div className="acciones">
            <button className="btn-secundario" onClick={descargarPDF}>
              Descargar PDF
            </button>
            <button className="btn-principal" onClick={enviarPorWhatsApp}>
              Enviar por WhatsApp
            </button>
            <button className="btn-limpiar" onClick={limpiarPedido}>
              Limpiar pedido
            </button>
          </div>

          <p className="nota">
            Nota: esta versión no muestra precios. El pedido se genera con marca,
            nombre del producto y cantidad.
          </p>
        </aside>
      </section>
    </main>
  )
}

export default App
