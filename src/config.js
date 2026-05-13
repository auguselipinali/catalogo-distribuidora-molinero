const rutaAsset = (ruta) => `${import.meta.env.BASE_URL}${ruta.replace(/^\/+/, '')}`

export const DISTRIBUIDORA = {
  nombre: 'Distribuidora Molinero',
  telefonoWhatsApp: '5492644530666',
  direccion: 'San Juan, Argentina',
  logo: rutaAsset('logo-distribuidora.jpeg'),
  googleSheetsUrl: "https://script.google.com/macros/s/AKfycbzopHMnPbtDMqivnOCzEc62xiYbz4VelTdBevxss6n94HdkFTNFCSV28PIQsfomHbsi/exec"
}


