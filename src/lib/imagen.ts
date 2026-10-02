import type { Complejo } from '../config/complejos'
import { claveTurno, type MapaTurnos } from './turnos'
import { etiquetaRelativa, fechaLarga } from './fechas'
import { logoUrl } from './marca'

export interface ContactoImagen {
  nombre: string
  telefono: string
}

// Imagen vertical pensada para WhatsApp (estado o chat)
const ANCHO = 1080
const ALTO = 1700

const C = {
  pelota: '#D2DA1F',
  blanco: '#FFFFFF',
}

const FUENTE = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif'

function cargarImagen(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, mal) => {
    const img = new Image()
    img.onload = () => ok(img)
    img.onerror = mal
    img.src = src
  })
}

async function prepararFuentes() {
  try {
    await Promise.all([
      document.fonts.load(`800 100px "Barlow Condensed"`),
      document.fonts.load(`700 60px "Barlow Condensed"`),
      document.fonts.load(`600 30px "Barlow Condensed"`),
    ])
  } catch {
    /* si no cargan, se usa la fuente de respaldo */
  }
}

// Random con semilla: la textura sale igual en cada generación
function aleatorio(semilla: number) {
  let s = semilla
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function texto(
  ctx: CanvasRenderingContext2D,
  t: string,
  x: number,
  y: number,
  tam: number,
  peso = 800,
  color = C.blanco,
  alinear: CanvasTextAlign = 'center',
  sombra = true,
) {
  ctx.save()
  ctx.font = `${peso} ${tam}px ${FUENTE}`
  ctx.textAlign = alinear
  ctx.textBaseline = 'middle'
  if (sombra) {
    ctx.shadowColor = 'rgba(0,0,0,0.55)'
    ctx.shadowBlur = tam * 0.12
    ctx.shadowOffsetY = tam * 0.04
  }
  ctx.fillStyle = color
  ctx.fillText(t, x, y)
  ctx.restore()
}

function anchoTexto(ctx: CanvasRenderingContext2D, t: string, tam: number, peso = 800) {
  ctx.save()
  ctx.font = `${peso} ${tam}px ${FUENTE}`
  const w = ctx.measureText(t).width
  ctx.restore()
  return w
}

/** Achica la fuente hasta que el texto entre en el ancho disponible */
function tamQueEntra(ctx: CanvasRenderingContext2D, t: string, tamMax: number, anchoMax: number, peso = 800) {
  let tam = tamMax
  while (tam > 12 && anchoTexto(ctx, t, tam, peso) > anchoMax) tam -= 2
  return tam
}

function pelota(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = r * 0.4
  ctx.shadowOffsetY = r * 0.12
  const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r)
  g.addColorStop(0, '#F4F87A')
  g.addColorStop(0.6, '#D2DA1F')
  g.addColorStop(1, '#9CA60F')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  // costuras
  ctx.strokeStyle = 'rgba(255,255,255,0.92)'
  ctx.lineWidth = r * 0.12
  ctx.beginPath()
  ctx.arc(cx - r * 1.05, cy, r * 0.78, -Math.PI / 3.2, Math.PI / 3.2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx + r * 1.05, cy, r * 0.78, Math.PI - Math.PI / 3.2, Math.PI + Math.PI / 3.2)
  ctx.stroke()
  ctx.restore()
}

function marcaDeAgua(ctx: CanvasRenderingContext2D, y = ALTO - 34) {
  ctx.save()
  ctx.globalAlpha = 0.6
  texto(ctx, '🎾 Desarrollado por Federico Olego 🎾', ANCHO / 2, y, 24, 600, C.blanco , 'center', true)
  ctx.restore()
}

function logoEn(ctx: CanvasRenderingContext2D, logo: HTMLImageElement | null, cx: number, cy: number, alto: number) {
  if (!logo) return
  const ancho = (logo.width / logo.height) * alto
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 24
  ctx.drawImage(logo, cx - ancho / 2, cy - alto / 2, ancho, alto)
  ctx.restore()
}

// ---------------------------------------------------------------------
// Estilo "bordó": como la imagen de Defensores, con pelotitas en los turnos reservados
// ---------------------------------------------------------------------
const B = {
  fondo: '#7A1510',
  fondoOscuro: '#4A0B08',
  negro: '#120202',
}

/** Franja diagonal (45°) que entra desde un borde, como las del diseño original */
function franja(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number, grosor: number) {
  const d = x1 - x0 // positivo: sube hacia la derecha
  ctx.beginPath()
  ctx.moveTo(x0, y)
  ctx.lineTo(x1, y - d)
  ctx.lineTo(x1, y - d + grosor)
  ctx.lineTo(x0, y + grosor)
  ctx.closePath()
  ctx.fill()
}

function fondoBordo(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(ANCHO / 2, ALTO * 0.45, 120, ANCHO / 2, ALTO * 0.5, ALTO * 0.75)
  g.addColorStop(0, '#86190F')
  g.addColorStop(0.65, B.fondo)
  g.addColorStop(1, B.fondoOscuro)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, ANCHO, ALTO)

  // textura de impresión, sutil (con semilla: sale igual siempre)
  const r = aleatorio(20261002)
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.035)'
    ctx.fillRect(r() * ANCHO, r() * ALTO, 1 + r() * 2, 1 + r() * 2)
  }

  // franjas negras: arriba a la izquierda y abajo a la derecha
  ctx.fillStyle = B.negro
  for (let i = 0; i < 3; i++) franja(ctx, -20, 70, 260 + i * 120, 62)
  for (let i = 0; i < 3; i++) franja(ctx, ANCHO + 20, ANCHO - 70, ALTO - 470 + i * 120, 62)
}

/** "HOY · VIERNES 02/10" (o solo el día si no es hoy, ayer o mañana) */
function lineaFechaBordo(ctx: CanvasRenderingContext2D, fecha: string, y: number) {
  const etiqueta = etiquetaRelativa(fecha)
  const t = `${etiqueta ? `${etiqueta} · ` : ''}${fechaLarga(fecha).toUpperCase()}`
  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  const w = anchoTexto(ctx, t, 50) + 70
  ctx.beginPath()
  ctx.roundRect(ANCHO / 2 - w / 2, y - 38, w, 76, 38)
  ctx.fill()
  texto(ctx, t, ANCHO / 2, y + 2, 50, 800, C.pelota)
}

function columnasBordo(ctx: CanvasRenderingContext2D, c: Complejo, turnos: MapaTurnos, top: number, alto: number) {
  const n = c.canchas.length
  const margen = 70
  const anchoCol = (ANCHO - margen * 2) / n
  const altoCab = 92
  const paso = Math.min(86, (alto - altoCab) / c.horarios.length)
  const tamHora = Math.min(...c.horarios.map((h) => tamQueEntra(ctx, `${h} HS`, paso * 0.86, anchoCol - 24)))

  c.canchas.forEach((cancha, i) => {
    const cx = margen + anchoCol * i + anchoCol / 2
    const nombre = cancha.toUpperCase()
    texto(ctx, nombre, cx, top + altoCab / 2 - 6, tamQueEntra(ctx, nombre, 78, anchoCol - 30))
    ctx.fillStyle = C.pelota
    ctx.fillRect(cx - 36, top + altoCab - 14, 72, 5)

    c.horarios.forEach((h, j) => {
      const y = top + altoCab + paso * j + paso / 2
      texto(ctx, `${h} HS`, cx, y + 2, tamHora)
      if (turnos[claveTurno(cancha, h)]?.estado === 'reservada') pelota(ctx, cx, y, paso * 0.4)
    })
  })
}

/** Contactos en grilla de 2 columnas (4 → 2×2, 3 → 2 + 1 centrado) */
function pieBordo(ctx: CanvasRenderingContext2D, lista: ContactoImagen[], top: number) {
  if (!lista.length) return
  texto(ctx, 'RESERVAS', ANCHO / 2, top, 40, 800, C.pelota)
  const filas: ContactoImagen[][] = []
  for (let i = 0; i < lista.length; i += 2) filas.push(lista.slice(i, i + 2))
  const altoFila = 112
  filas.forEach((fila, k) => {
    const y = top + 70 + altoFila * k
    fila.forEach((ct, j) => {
      const x = fila.length === 1 ? ANCHO / 2 : j === 0 ? ANCHO * 0.29 : ANCHO * 0.71
      const nombre = ct.nombre.toUpperCase()
      texto(ctx, nombre, x, y, tamQueEntra(ctx, nombre, 40, 400, 700), 700, 'rgba(255,255,255,0.85)')
      texto(ctx, ct.telefono, x, y + 46, tamQueEntra(ctx, ct.telefono, 54, 420))
    })
  })
}

function dibujarBordo(ctx: CanvasRenderingContext2D, c: Complejo, fecha: string, turnos: MapaTurnos, logo: HTMLImageElement | null, contactos: ContactoImagen[]) {
  fondoBordo(ctx)
  texto(ctx, 'TURNOS', 330, 175, 178)
  texto(ctx, 'LIBRES', 330, 335, 178)
  logoEn(ctx, logo, 845, 255, 330)
  lineaFechaBordo(ctx, fecha, 495)

  const filasPie = Math.ceil(contactos.length / 2)
  const altoPie = contactos.length ? 70 + 112 * filasPie + 40 : 0
  const top = 575
  const finColumnas = ALTO - 70 - altoPie
  columnasBordo(ctx, c, turnos, top, finColumnas - top)
  pieBordo(ctx, contactos, finColumnas + 40)
  marcaDeAgua(ctx, ALTO - 38)
}

export async function generarImagen(c: Complejo, fecha: string, turnos: MapaTurnos, contactos: ContactoImagen[]): Promise<Blob> {
  await prepararFuentes()
  const logo = await cargarImagen(logoUrl()).catch(() => null)
  const canvas = document.createElement('canvas')
  canvas.width = ANCHO
  canvas.height = ALTO
  const ctx = canvas.getContext('2d')!
  dibujarBordo(ctx, c, fecha, turnos, logo, contactos)
  return new Promise((ok, mal) => canvas.toBlob((b) => (b ? ok(b) : mal(new Error('No se pudo generar la imagen'))), 'image/png'))
}

export const nombreArchivo = (c: Complejo, fecha: string) => `turnos-${c.id}-${fecha}.png`