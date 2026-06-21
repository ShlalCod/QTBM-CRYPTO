/**
 * QTBM CRYPTO — Price Stream Mini-Service (REAL Binance data)
 *
 * Connects to Binance public WebSocket and re-broadcasts real prices
 * to connected clients. No API key required.
 *
 * Port: 3003 (fixed)
 * Path: / (caddy forwards via XTransformPort)
 */

import { createServer } from 'http'
import { Server } from 'socket.io'
import { WebSocket as WsClient } from 'ws'

const PORT = 3003

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ─── Price Data ────────────────────────────────────────────────

interface PriceInfo {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  high24h: number
  low24h: number
}

// Top symbols tracked (Binance stream names: btcusdt@trade)
const TOP_SYMBOLS = [
  'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX',
  'DOT', 'MATIC', 'LINK', 'LTC', 'BCH', 'UNI', 'ATOM', 'ETC',
  'FIL', 'APT', 'ARB', 'OP', 'NEAR', 'INJ', 'SUI', 'SEI',
]

const livePrices: Record<string, PriceInfo> = {}

// Initialize with empty values (filled by REST fetch + WebSocket)
for (const sym of TOP_SYMBOLS) {
  const symbol = `${sym}USDT`
  livePrices[symbol] = {
    symbol,
    price: 0,
    change24h: 0,
    changePercent24h: 0,
    high24h: 0,
    low24h: 0,
  }
}

// ─── REST: Initial 24h ticker fetch ────────────────────────────
async function fetchInitialTickers() {
  try {
    const symbolsParam = encodeURIComponent(
      JSON.stringify(TOP_SYMBOLS.map((s) => `${s}USDT`))
    )
    const resp = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbols=${symbolsParam}`
    )
    if (!resp.ok) {
      console.error('[price-stream] Binance REST 24hr failed:', resp.status)
      return
    }
    const tickers = await resp.json()
    for (const t of tickers) {
      const symbol = t.symbol
      const lastPrice = parseFloat(t.lastPrice)
      livePrices[symbol] = {
        symbol,
        price: lastPrice,
        change24h: parseFloat(t.priceChange),
        changePercent24h: parseFloat(t.priceChangePercent),
        high24h: parseFloat(t.highPrice),
        low24h: parseFloat(t.lowPrice),
      }
    }
    console.log(`[price-stream] Loaded ${tickers.length} tickers from Binance`)
  } catch (err) {
    console.error('[price-stream] REST fetch error:', err)
  }
}

// ─── WebSocket: Subscribe to Binance trade streams ─────────────
const BINANCE_WS_URL = `wss://stream.binance.com:9443/stream?streams=${TOP_SYMBOLS.map(
  (s) => `${s.toLowerCase()}usdt@trade`
).join('/')}`

let binanceWs: WsClient | null = null

function connectBinance() {
  try {
    binanceWs = new WsClient(BINANCE_WS_URL)

    binanceWs.on('open', () => {
      console.log('[price-stream] Connected to Binance WebSocket')
    })

    binanceWs.on('message', (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString())
        const trade = msg.data ?? msg
        if (!trade.s || !trade.p) return

        const symbol = trade.s
        const price = parseFloat(trade.p)

        if (livePrices[symbol]) {
          livePrices[symbol].price = price
        }

        // Broadcast to all connected clients
        io.emit('price-update', { symbol, price, timestamp: Date.now() })
      } catch {
        // ignore malformed
      }
    })

    binanceWs.on('error', (err) => {
      console.error('[price-stream] Binance WS error:', err.message)
    })

    binanceWs.on('close', () => {
      console.log('[price-stream] Binance WS closed, reconnecting in 3s...')
      setTimeout(connectBinance, 3000)
    })
  } catch (err) {
    console.error('[price-stream] Binance WS connect failed:', err)
    setTimeout(connectBinance, 5000)
  }
}

// ─── Periodic 24h stats refresh (every 60s) ────────────────────
setInterval(fetchInitialTickers, 60000)

// ─── Client connection handling ────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[price-stream] Client connected: ${socket.id}`)

  // Send current prices immediately on connect
  socket.emit('price-update', livePrices)

  // Client can subscribe to specific symbols (optional optimization)
  socket.on('subscribe', (symbols: string[]) => {
    socket.join('subscribers')
    // For now, all clients get all prices (simple broadcast model)
  })

  socket.on('unsubscribe', () => {
    socket.leave('subscribers')
  })

  socket.on('disconnect', () => {
    console.log(`[price-stream] Client disconnected: ${socket.id}`)
  })
})

// ─── Broadcast all prices every 2s (for clients that missed WS updates) ──
setInterval(() => {
  if (Object.keys(livePrices).length > 0) {
    io.emit('price-update', livePrices)
  }
}, 2000)

// ─── Start server ──────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`[price-stream] Server running on port ${PORT}`)
  console.log(`[price-stream] Connecting to Binance...`)
  fetchInitialTickers()
  connectBinance()
})
