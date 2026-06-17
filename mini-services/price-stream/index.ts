import { createServer } from 'http'
import { Server } from 'socket.io'

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

// Initialize ~20 crypto assets with realistic prices
const initialPrices: Record<string, PriceInfo> = {
  BTCUSDT:  { symbol: 'BTCUSDT',  price: 67432.18, change24h: 1234.56,  changePercent24h: 1.86,  high24h: 68250.00, low24h: 65800.00 },
  ETHUSDT:  { symbol: 'ETHUSDT',  price: 3521.45,  change24h: 45.67,    changePercent24h: 1.31,  high24h: 3580.00,  low24h: 3420.00 },
  BNBUSDT:  { symbol: 'BNBUSDT',  price: 598.23,   change24h: -12.45,   changePercent24h: -2.04, high24h: 618.00,   low24h: 590.00 },
  SOLUSDT:  { symbol: 'SOLUSDT',  price: 178.92,   change24h: 8.34,     changePercent24h: 4.89,  high24h: 185.00,   low24h: 168.00 },
  XRPUSDT:  { symbol: 'XRPUSDT',  price: 0.6234,   change24h: -0.0156,  changePercent24h: -2.44, high24h: 0.6480,   low24h: 0.6100 },
  ADAUSDT:  { symbol: 'ADAUSDT',  price: 0.4521,   change24h: 0.0123,   changePercent24h: 2.80,  high24h: 0.4680,   low24h: 0.4320 },
  DOGEUSDT: { symbol: 'DOGEUSDT', price: 0.1234,   change24h: 0.0045,   changePercent24h: 3.78,  high24h: 0.1290,   low24h: 0.1170 },
  AVAXUSDT: { symbol: 'AVAXUSDT', price: 35.67,    change24h: -1.23,    changePercent24h: -3.33, high24h: 37.80,    low24h: 34.50 },
  DOTUSDT:  { symbol: 'DOTUSDT',  price: 7.23,     change24h: 0.15,     changePercent24h: 2.12,  high24h: 7.45,     low24h: 6.98 },
  LINKUSDT: { symbol: 'LINKUSDT', price: 14.56,    change24h: 0.78,     changePercent24h: 5.66,  high24h: 15.20,    low24h: 13.50 },
  MATICUSDT:{ symbol: 'MATICUSDT',price: 0.7234,   change24h: -0.0234,  changePercent24h: -3.13, high24h: 0.7560,   low24h: 0.7000 },
  UNIUSDT:  { symbol: 'UNIUSDT',  price: 7.89,     change24h: 0.23,     changePercent24h: 3.00,  high24h: 8.15,     low24h: 7.50 },
  ATOMUSDT: { symbol: 'ATOMUSDT', price: 8.92,     change24h: -0.34,    changePercent24h: -3.68, high24h: 9.45,     low24h: 8.60 },
  LTCUSDT:  { symbol: 'LTCUSDT',  price: 84.32,    change24h: 2.15,     changePercent24h: 2.61,  high24h: 86.50,    low24h: 81.00 },
  NEARUSDT: { symbol: 'NEARUSDT', price: 5.67,     change24h: 0.34,     changePercent24h: 6.38,  high24h: 5.90,     low24h: 5.20 },
  APTUSDT:  { symbol: 'APTUSDT',  price: 8.45,     change24h: -0.56,    changePercent24h: -6.22, high24h: 9.20,     low24h: 8.10 },
  ARBUSDT:  { symbol: 'ARBUSDT',  price: 1.12,     change24h: 0.05,     changePercent24h: 4.67,  high24h: 1.18,     low24h: 1.05 },
  OPUSDT:   { symbol: 'OPUSDT',   price: 2.34,     change24h: 0.12,     changePercent24h: 5.41,  high24h: 2.45,     low24h: 2.18 },
  FILUSDT:  { symbol: 'FILUSDT',  price: 5.89,     change24h: -0.23,    changePercent24h: -3.76, high24h: 6.20,     low24h: 5.60 },
  IMXUSDT:  { symbol: 'IMXUSDT',  price: 1.56,     change24h: 0.08,     changePercent24h: 5.41,  high24h: 1.62,     low24h: 1.45 },
  ETHBTC:   { symbol: 'ETHBTC',   price: 0.05223,  change24h: 0.00034,  changePercent24h: 0.65,  high24h: 0.05310,  low24h: 0.05100 },
  BNBBTC:   { symbol: 'BNBBTC',   price: 0.00887,  change24h: -0.00029, changePercent24h: -3.17, high24h: 0.00925,  low24h: 0.00870 },
  SOLBTC:   { symbol: 'SOLBTC',   price: 0.002653, change24h: 0.000089, changePercent24h: 3.47,  high24h: 0.002740, low24h: 0.002510 },
  BNBETH:   { symbol: 'BNBETH',   price: 0.16984,  change24h: -0.00528, changePercent24h: -3.01, high24h: 0.17640,  low24h: 0.16720 },
  SOLETH:   { symbol: 'SOLETH',   price: 0.05080,  change24h: 0.00172,  changePercent24h: 3.51,  high24h: 0.05240,  low24h: 0.04810 },
  LINKETH:  { symbol: 'LINKETH',  price: 0.004134, change24h: 0.000198, changePercent24h: 5.03,  high24h: 0.004350, low24h: 0.003880 },
  SOLBNB:   { symbol: 'SOLBNB',   price: 0.29916,  change24h: 0.01538,  changePercent24h: 5.42,  high24h: 0.31200,  low24h: 0.28050 },
  CAKEBNB:  { symbol: 'CAKEBNB',  price: 0.00567,  change24h: 0.00034,  changePercent24h: 6.38,  high24h: 0.00600,  low24h: 0.00520 },
}

// Working copy of prices that get updated
const livePrices: Record<string, PriceInfo> = JSON.parse(JSON.stringify(initialPrices))

// ─── Candle History ────────────────────────────────────────────

interface CandlePoint {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Simulated candle history per symbol (last 60 points)
const candleHistory: Record<string, CandlePoint[]> = {}

function initCandleHistory(symbol: string, basePrice: number) {
  const candles: CandlePoint[] = []
  const now = Math.floor(Date.now() / 1000)
  let price = basePrice

  // Determine volatility based on price magnitude
  let volatility: number
  if (basePrice >= 1000) volatility = basePrice * 0.003
  else if (basePrice >= 1) volatility = basePrice * 0.005
  else volatility = basePrice * 0.008

  for (let i = 59; i >= 0; i--) {
    const time = now - i * 60 // 1-minute candles
    const change = (Math.random() - 0.48) * volatility
    const open = price
    price += change
    const close = price
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5

    candles.push({
      time,
      open: roundPrice(open, basePrice),
      high: roundPrice(high, basePrice),
      low: roundPrice(low, basePrice),
      close: roundPrice(close, basePrice),
      volume: Math.round(Math.random() * 500 + 50),
    })
  }

  candleHistory[symbol] = candles
}

function roundPrice(value: number, basePrice: number): number {
  if (basePrice >= 1000) return Math.round(value * 100) / 100
  if (basePrice >= 1) return Math.round(value * 10000) / 10000
  if (basePrice >= 0.01) return Math.round(value * 1000000) / 1000000
  return Math.round(value * 100000000) / 100000000
}

// Initialize candle history for all symbols
for (const [symbol, info] of Object.entries(initialPrices)) {
  initCandleHistory(symbol, info.price)
}

// ─── Price Update Logic ────────────────────────────────────────

function getDecimals(price: number): number {
  if (price >= 1000) return 2
  if (price >= 1) return 4
  if (price >= 0.01) return 6
  return 8
}

function updatePrices() {
  const symbols = Object.keys(livePrices)

  for (const symbol of symbols) {
    const info = livePrices[symbol]
    const currentPrice = info.price
    if (!currentPrice || currentPrice === 0) continue

    // Random change between ±0.05% and ±0.3%
    const changePercent = (Math.random() - 0.5) * 0.6 // ±0.3%
    const newPrice = currentPrice * (1 + changePercent / 100)
    const decimals = getDecimals(currentPrice)
    const roundedPrice = parseFloat(newPrice.toFixed(decimals))

    // Update price info
    info.price = roundedPrice
    info.change24h += roundedPrice - currentPrice
    info.changePercent24h = (info.change24h / (roundedPrice - info.change24h)) * 100

    // Update high/low
    if (roundedPrice > info.high24h) info.high24h = roundedPrice
    if (roundedPrice < info.low24h) info.low24h = roundedPrice
  }
}

// ─── Client Subscriptions ──────────────────────────────────────

const clientSubscriptions = new Map<string, Set<string>>() // socketId -> Set<symbol>

// ─── Socket.IO Events ─────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[Price Stream] Client connected: ${socket.id}`)

  // Send initial prices on connection
  socket.emit('price-update', livePrices)

  // Initialize empty subscription set
  clientSubscriptions.set(socket.id, new Set())

  // Handle subscribe event - client subscribes to specific symbols
  socket.on('subscribe', (data: { symbols: string[] }) => {
    const subs = clientSubscriptions.get(socket.id)
    if (subs) {
      data.symbols.forEach((s) => subs.add(s))
      console.log(`[Price Stream] Client ${socket.id} subscribed to: ${data.symbols.join(', ')}`)
    }
  })

  // Handle unsubscribe event
  socket.on('unsubscribe', (data: { symbols: string[] }) => {
    const subs = clientSubscriptions.get(socket.id)
    if (subs) {
      data.symbols.forEach((s) => subs.delete(s))
      console.log(`[Price Stream] Client ${socket.id} unsubscribed from: ${data.symbols.join(', ')}`)
    }
  })

  // Handle get-history event - return last 60 candle points for a symbol
  socket.on('get-history', (data: { symbol: string }, callback?: (response: { symbol: string; candles: CandlePoint[] }) => void) => {
    const symbol = data.symbol
    const candles = candleHistory[symbol] || []
    console.log(`[Price Stream] Client ${socket.id} requested history for ${symbol} (${candles.length} candles)`)

    if (callback) {
      callback({ symbol, candles })
    } else {
      socket.emit('history-data', { symbol, candles })
    }
  })

  socket.on('disconnect', (reason) => {
    console.log(`[Price Stream] Client disconnected: ${socket.id} (${reason})`)
    clientSubscriptions.delete(socket.id)
  })

  socket.on('error', (error) => {
    console.error(`[Price Stream] Socket error (${socket.id}):`, error)
  })
})

// ─── Price Update Interval (1-2 seconds) ─────────────────────

let priceUpdateCounter = 0

setInterval(() => {
  priceUpdateCounter++
  updatePrices()
  io.emit('price-update', livePrices)

  // Update candle history - add a new candle every 60 ticks (~60-120 seconds)
  if (priceUpdateCounter % 60 === 0) {
    const now = Math.floor(Date.now() / 1000)
    for (const [symbol, info] of Object.entries(livePrices)) {
      const history = candleHistory[symbol]
      if (history && history.length > 0) {
        const lastCandle = history[history.length - 1]
        // Close the last candle and open a new one
        lastCandle.close = info.price
        if (info.price > lastCandle.high) lastCandle.high = info.price
        if (info.price < lastCandle.low) lastCandle.low = info.price

        // Push new candle
        history.push({
          time: now,
          open: info.price,
          high: info.price,
          low: info.price,
          close: info.price,
          volume: 0,
        })

        // Keep only last 60 candles
        if (history.length > 60) {
          history.shift()
        }
      }
    }
  }
}, 1500) // 1.5 seconds

// ─── Ticker Update Interval (every 5 seconds) ─────────────────

setInterval(() => {
  const symbols = Object.keys(livePrices)
  if (symbols.length === 0) return

  // Pick a random symbol and create a significant change
  const randomIndex = Math.floor(Math.random() * symbols.length)
  const symbol = symbols[randomIndex]
  const info = livePrices[symbol]

  // Apply a larger change (±0.5-2%) for the ticker update
  const significantChange = (Math.random() - 0.5) * 4 // ±2%
  const oldPrice = info.price
  const newPrice = oldPrice * (1 + significantChange / 100)
  const decimals = getDecimals(oldPrice)
  info.price = parseFloat(newPrice.toFixed(decimals))

  // Update 24h change
  info.change24h += info.price - oldPrice
  info.changePercent24h = (info.change24h / (info.price - info.change24h)) * 100
  if (info.price > info.high24h) info.high24h = info.price
  if (info.price < info.low24h) info.low24h = info.price

  const direction = info.price > oldPrice ? 'up' : 'down'
  const changeAmount = Math.abs(info.price - oldPrice)

  io.emit('ticker-update', {
    symbol,
    price: info.price,
    oldPrice,
    changeAmount,
    changePercent: significantChange,
    direction,
    timestamp: Date.now(),
  })

  console.log(`[Price Stream] Ticker update: ${symbol} ${direction} ${changeAmount.toFixed(decimals)} (${significantChange > 0 ? '+' : ''}${significantChange.toFixed(2)}%)`)
}, 5000)

// ─── Start Server ──────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`[QTBM Price Stream] WebSocket server running on port ${PORT}`)
  console.log(`[QTBM Price Stream] Streaming ${Object.keys(initialPrices).length} trading pairs`)
})

// ─── Graceful Shutdown ─────────────────────────────────────────

process.on('SIGTERM', () => {
  console.log('[QTBM Price Stream] Received SIGTERM, shutting down...')
  httpServer.close(() => {
    console.log('[QTBM Price Stream] Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[QTBM Price Stream] Received SIGINT, shutting down...')
  httpServer.close(() => {
    console.log('[QTBM Price Stream] Server closed')
    process.exit(0)
  })
})
