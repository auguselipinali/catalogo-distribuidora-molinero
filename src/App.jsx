import { useEffect, useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import { productosIniciales } from './products.js'
import { DISTRIBUIDORA } from './config.js'

const bannersPromocionales = [
  'banners/banner-general.png',
  'banners/banner-fidelite.png',
  'banners/banner-frilayp.png',
  'banners/banner-marybosques.png',
  'banners/banner-primont.png',
  'banners/banner-fithocolor-otowil.png',
  'banners/banner-tonaleg-dermogreen.png',
]

const marcasCarrusel = [
  { nombre: 'DERMOGREEN', logo: 'productos/marca-dermogreen.png' },
  { nombre: 'EMYNENT', logo: 'productos/marca-emynent.png' },
  { nombre: 'FIDELITÉ', logo: 'productos/marca-fidelite.png' },
  { nombre: 'FITHOCOLOR', logo: 'productos/marca-fithocolor.png' },
  { nombre: 'FRILAYP', logo: 'productos/marca-frilayp.png' },
  { nombre: 'MABELL ROMMER', logo: 'productos/marca-mabell-rommer.png' },
  { nombre: 'MARY BOSQUES', logo: 'productos/marca-mary-bosques.png' },
  { nombre: 'OTOWIL', logo: 'productos/marca-otowil.png' },
  { nombre: 'PRIMONT', logo: 'productos/marca-primont-professional.png' },
  { nombre: 'TONALEG', logo: 'productos/marca-tonaleg.png' },
]

const PRODUCTOS_POR_PAGINA = 24

function normalizarTexto(texto) {
  return texto
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function rutaAsset(ruta) {
  return `${import.meta.env.BASE_URL}${ruta.replace(/^\/+/, '')}`
}

function App() {
  const [busqueda, setBusqueda] = useState('')
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('TODAS')
  const [carrito, setCarrito] = useState([])
  const [cliente, setCliente] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    observacion: '',
  })
  const [pedidoAbierto, setPedidoAbierto] = useState(false)
  const [bannerActual, setBannerActual] = useState(0)
  const [paginaActual, setPaginaActual] = useState(1)

  useEffect(() => {
    const intervalo = setInterval(() => {
      setBannerActual((actual) => (actual + 1) % bannersPromocionales.length)
    }, 4500)

    return () => clearInterval(intervalo)
  }, [])

  const marcas = useMemo(() => {
    const marcasUnicas = [...new Set(productosIniciales.map((producto) => producto.marca))]
    return ['TODAS', ...marcasUnicas.sort()]
  }, [])

  const marcasCarruselLoop = useMemo(() => {
    return [...marcasCarrusel, ...marcasCarrusel]
  }, [])

  const productosFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda.trim())

    return productosIniciales.filter((producto) => {
      const contenido = normalizarTexto(
        `${producto.marca} ${producto.categoria || ''} ${producto.nombre}`,
      )

      const coincideBusqueda = texto === '' || contenido.includes(texto)
      const coincideMarca = marcaSeleccionada === 'TODAS' || producto.marca === marcaSeleccionada

      return coincideBusqueda && coincideMarca
    })
  }, [busqueda, marcaSeleccionada])

  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA))
  const indiceInicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA
  const indiceFin = Math.min(indiceInicio + PRODUCTOS_POR_PAGINA, productosFiltrados.length)

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas)
    }
  }, [paginaActual, totalPaginas])

  const productosPaginados = useMemo(() => {
    return productosFiltrados.slice(indiceInicio, indiceFin)
  }, [productosFiltrados, indiceInicio, indiceFin])

  const productosPorMarca = useMemo(() => {
    return productosPaginados.reduce((grupos, producto) => {
      if (!grupos[producto.marca]) grupos[producto.marca] = []
      grupos[producto.marca].push(producto)
      return grupos
    }, {})
  }, [productosPaginados])

  const paginasVisibles = useMemo(() => {
    const paginas = []
    const inicio = Math.max(1, paginaActual - 2)
    const fin = Math.min(totalPaginas, paginaActual + 2)

    for (let i = inicio; i <= fin; i += 1) {
      paginas.push(i)
    }

    return paginas
  }, [paginaActual, totalPaginas])

  const totalProductos = productosIniciales.length
  const totalMarcas = new Set(productosIniciales.map((producto) => producto.marca)).size
  const cantidadTotalPedido = carrito.reduce((total, item) => total + item.cantidad, 0)

  function cambiarPagina(nuevaPagina) {
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return

    setPaginaActual(nuevaPagina)

    setTimeout(() => {
      document.querySelector('.catalogo')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 50)
  }

  function agregarProducto(producto) {
    setCarrito((actual) => {
      const existe = actual.find((item) => item.id === producto.id)

      if (existe) {
        return actual.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item,
        )
      }

      return [...actual, { ...producto, cantidad: 1 }]
    })
  }

  function cambiarCantidad(id, nuevaCantidad) {
    const cantidad = Number(nuevaCantidad)

    if (!Number.isFinite(cantidad)) return

    if (cantidad <= 0) {
      quitarProducto(id)
      return
    }

    setCarrito((actual) =>
      actual.map((item) => (item.id === id ? { ...item, cantidad: Math.floor(cantidad) } : item)),
    )
  }

  function quitarProducto(id) {
    setCarrito((actual) => actual.filter((item) => item.id !== id))
  }

  function limpiarPedido() {
    setCarrito([])
    setCliente({
      nombre: '',
      telefono: '',
      direccion: '',
      observacion: '',
    })
  }

  function obtenerCantidadEnCarrito(id) {
    return carrito.find((item) => item.id === id)?.cantidad || 0
  }

  function sumarDesdeCatalogo(producto) {
    agregarProducto(producto)
  }

  function restarDesdeCatalogo(producto) {
    const cantidadActual = obtenerCantidadEnCarrito(producto.id)

    if (cantidadActual <= 1) {
      quitarProducto(producto.id)
      return
    }

    cambiarCantidad(producto.id, cantidadActual - 1)
  }

  function actualizarCantidadDesdeCatalogo(producto, valor) {
    if (valor === '') return

    const cantidad = Number(valor)

    if (!Number.isFinite(cantidad)) return

    if (cantidad <= 0) {
      quitarProducto(producto.id)
      return
    }

    cambiarCantidad(producto.id, Math.floor(cantidad))
  }

  function actualizarCantidadDesdePedido(id, valor) {
    if (valor === '') return

    const cantidad = Number(valor)

    if (!Number.isFinite(cantidad)) return

    cambiarCantidad(id, Math.floor(cantidad))
  }

  function obtenerImagenProducto(producto) {
    if (producto.id >= 77 && producto.id <= 173) {
      return rutaAsset('productos-reales/tinturas-colormaster.webp')
    }

    if (producto.id >= 186 && producto.id <= 242) {
      return rutaAsset('productos-reales/tinturas-fithocolor.webp')
    }

    if (producto.id >= 243 && producto.id <= 261) {
      return rutaAsset('productos-reales/tinturas-cielo.webp')
    }

    if (producto.id >= 262 && producto.id <= 320) {
      return rutaAsset('productos-reales/tinturas-otowil.webp')
    }

    if (producto.id >= 865 && producto.id <= 954) {
      return rutaAsset('productos-reales/tinturas-primont.webp')
    }

    return rutaAsset(`productos-reales/${producto.id}.webp`)
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

  function validarPedido() {
    if (carrito.length === 0) {
      alert('Agregá productos al pedido antes de generar el PDF.')
      return false
    }

    if (!cliente.nombre.trim()) {
      alert('Ingresá el nombre del cliente/local antes de finalizar el pedido.')
      return false
    }

    return true
  }

  async function guardarPedidoEnGoogleSheets() {
    if (!DISTRIBUIDORA.googleSheetsUrl) {
      console.warn('No hay URL de Google Sheets configurada.')
      return
    }

    const pedidoId = `PED-${Date.now()}`

    const datosPedido = {
      pedidoId,
      fecha: new Date().toLocaleString('es-AR'),
      cliente: {
        nombre: cliente.nombre.trim(),
        telefono: cliente.telefono.trim(),
        direccion: cliente.direccion.trim(),
        observacion: cliente.observacion.trim(),
      },
      productos: carrito.map((item) => ({
        marca: item.marca,
        nombre: item.nombre,
        cantidad: item.cantidad,
      })),
    }

    let iframe = document.querySelector('iframe[name="google-sheets-iframe"]')

    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.name = 'google-sheets-iframe'
      iframe.style.display = 'none'
      document.body.appendChild(iframe)
    }

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = DISTRIBUIDORA.googleSheetsUrl
    form.target = 'google-sheets-iframe'
    form.style.display = 'none'

    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = 'payload'
    input.value = JSON.stringify(datosPedido)

    form.appendChild(input)
    document.body.appendChild(form)
    form.submit()

    setTimeout(() => {
      form.remove()
    }, 1000)
  }

  async function crearPDF() {
    if (!validarPedido()) return null

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

    await guardarPedidoEnGoogleSheets()

    const nombreCliente = cliente.nombre.trim()
    doc.save(`pedido-${nombreCliente}.pdf`)
  }

  const renderPedidoContenido = () => (
    <>
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
                step="1"
                value={item.cantidad}
                onChange={(e) => actualizarCantidadDesdePedido(item.id, e.target.value)}
                onFocus={(e) => e.target.select()}
              />

              <button type="button" className="btn-icon" onClick={() => quitarProducto(item.id)}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="cliente-form">
        <h3>
          Datos del cliente
          <span className="campo-obligatorio">*Nombre obligatorio</span>
        </h3>

        <input
          required
          placeholder="Nombre del cliente/local*"
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
        <button type="button" className="btn-secundario" onClick={descargarPDF}>
          Descargar PDF
        </button>

        <button type="button" className="btn-limpiar" onClick={limpiarPedido}>
          Limpiar pedido
        </button>
      </div>

      <p className="nota">
        Nota: descargá el pedido desde el botón "Descargar PDF" y envialo por WhatsApp.
      </p>
    </>
  )

  return (
    <main className="app">
      <header className="hero">
        <div className="hero-brand">
          <img className="logo" src={DISTRIBUIDORA.logo} alt={DISTRIBUIDORA.nombre} />

          <div>
            <p className="eyebrow">Catálogo digital</p>
            <h1>{DISTRIBUIDORA.nombre}</h1>
            <p className="hero-text">Elegí productos, armá el pedido y envialo por WhatsApp.</p>
          </div>
        </div>

        <div className="hero-card">
          <strong>{cantidadTotalPedido}</strong>
          <span>productos en pedido</span>
        </div>
      </header>

<section className="promos-section">


  <div className="marcas-carousel">
          <div className="marcas-carousel-header">
            <span>Marcas que trabajamos</span>
          </div>

          <div className="marcas-track">
            <div className="marcas-track-inner">
              {marcasCarruselLoop.map((marca, index) => (
                <div className="marca-slide" key={`${marca.nombre}-${index}`}>
                  <img
                    src={rutaAsset(marca.logo)}
                    alt={marca.nombre}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <span>{marca.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="layout">
        <section className="catalogo">
          <div className="section-header">
            <div>
              <h2>Productos</h2>
              <p>
                {totalProductos} productos cargados, organizados por {totalMarcas} marcas.
              </p>
            </div>

            <input
              type="search"
              placeholder="Buscar producto o marca..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setPaginaActual(1)
              }}
            />
          </div>

          <div className="filtro-marca-card">
            <div className="filtro-marca-texto">
              <span>Filtrar por marca</span>
              <p>Elegí una marca para ver sus productos</p>
            </div>

            <select
              className="filtro-marca-select-control"
              value={marcaSeleccionada}
              onChange={(e) => {
                setMarcaSeleccionada(e.target.value)
                setPaginaActual(1)
              }}
            >
              {marcas.map((marca) => (
                <option key={marca} value={marca}>
                  {marca === 'TODAS' ? 'Todas las marcas' : marca}
                </option>
              ))}
            </select>
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
                  {productos.map((producto) => {
                    const cantidadEnCarrito = obtenerCantidadEnCarrito(producto.id)

                    return (
                      <article className="producto-card" key={producto.id}>
                        <img
                          loading="lazy"
                          decoding="async"
                          src={obtenerImagenProducto(producto)}
                          alt={producto.nombre}
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = producto.imagen || DISTRIBUIDORA.logo
                          }}
                        />

                        <p className="producto-marca">{producto.marca}</p>
                        <h3>{producto.nombre}</h3>

                        {cantidadEnCarrito === 0 ? (
                          <button
                            type="button"
                            className="btn-agregar-producto"
                            onClick={() => agregarProducto(producto)}
                          >
                            Agregar al pedido
                          </button>
                        ) : (
                          <div className="producto-contador">
                            <button
                              type="button"
                              className="btn-cantidad-producto"
                              onClick={() => restarDesdeCatalogo(producto)}
                            >
                              −
                            </button>

                            <div className="cantidad-producto-input-wrap">
                              <input
                                className="cantidad-producto-input"
                                type="number"
                                min="1"
                                step="1"
                                value={cantidadEnCarrito}
                                onChange={(e) =>
                                  actualizarCantidadDesdeCatalogo(producto, e.target.value)
                                }
                                onFocus={(e) => e.target.select()}
                              />
                              <span>un</span>
                            </div>

                            <button
                              type="button"
                              className="btn-cantidad-producto"
                              onClick={() => sumarDesdeCatalogo(producto)}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              </section>
            ))
          )}

          {productosFiltrados.length > PRODUCTOS_POR_PAGINA && (
            <div className="paginacion">
              <p>
                Mostrando {indiceInicio + 1} - {indiceFin} de {productosFiltrados.length} productos
              </p>

              <div className="paginacion-controles">
                <button
                  type="button"
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                >
                  Anterior
                </button>

                {paginaActual > 3 && (
                  <>
                    <button type="button" onClick={() => cambiarPagina(1)}>
                      1
                    </button>
                    <span>...</span>
                  </>
                )}

                {paginasVisibles.map((pagina) => (
                  <button
                    key={pagina}
                    type="button"
                    className={pagina === paginaActual ? 'activo' : ''}
                    onClick={() => cambiarPagina(pagina)}
                  >
                    {pagina}
                  </button>
                ))}

                {paginaActual < totalPaginas - 2 && (
                  <>
                    <span>...</span>
                    <button type="button" onClick={() => cambiarPagina(totalPaginas)}>
                      {totalPaginas}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="pedido-panel">
          <h2>Pedido</h2>
          {renderPedidoContenido()}
        </aside>
      </section>

      <button type="button" className="boton-pedido-mobile" onClick={() => setPedidoAbierto(true)}>
        🛒 Ver pedido ({cantidadTotalPedido})
      </button>

      {pedidoAbierto && (
        <div className="pedido-modal-overlay activo" onClick={() => setPedidoAbierto(false)}>
          <div className="pedido-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pedido-modal-header">
              <h2>Pedido</h2>

              <button type="button" className="cerrar-pedido" onClick={() => setPedidoAbierto(false)}>
                Cerrar
              </button>
            </div>

            {renderPedidoContenido()}
          </div>
        </div>
      )}
    </main>
  )
}

export default App