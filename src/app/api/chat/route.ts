import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Simulated live prices (same as frontend price simulator)
const LIVE_PRICES: Record<string, number> = {
  BTCUSDT: 67543.21, ETHUSDT: 3456.78, BNBUSDT: 581.32, SOLUSDT: 172.45,
  XRPUSDT: 0.6234, ADAUSDT: 0.4521, DOGEUSDT: 0.1654, AVAXUSDT: 35.67,
  DOTUSDT: 7.23, LINKUSDT: 14.56, MATICUSDT: 0.7123, UNIUSDT: 9.87,
  ATOMUSDT: 9.34, LTCUSDT: 84.21, NEARUSDT: 5.67, APTUSDT: 8.92,
  ARBUSDT: 1.12, OPUSDT: 2.34, FILUSDT: 5.78, IMXUSDT: 2.12,
};

function getLivePricesString(): string {
  // Add slight randomness to simulate live data
  const prices = Object.entries(LIVE_PRICES).map(([pair, price]) => {
    const change = price * (1 + (Math.random() - 0.5) * 0.006); // ±0.3%
    return `${pair}: $${change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: price < 1 ? 4 : 2 })}`;
  });
  return prices.join(', ');
}

const BASE_SYSTEM_PROMPT = `You are QTBM AI, a helpful assistant for the QTBM BANK crypto exchange platform. You help users with:
- Trading questions (spot, margin, futures)
- Platform features (Earn, P2P, Launchpad, Staking, Swap)
- Security best practices (2FA, KYC, wallet safety)
- Crypto education (Bitcoin, Ethereum, DeFi, blockchain basics)
- Account management (deposits, withdrawals, transfers)
- Fee structures and trading pairs
- Referral program details

Keep responses concise and helpful. When discussing trading, always include risk warnings. QTBM BANK supports 200+ trading pairs with spot, margin (3x-5x), and futures (up to 125x) trading. The platform also offers Earn products with up to 12% APR, P2P trading, and a Launchpad for new token launches.`;

// Cache the ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// Fallback responses for when AI is unavailable
const fallbackResponses: Record<string, string> = {
  bitcoin: 'Bitcoin (BTC) is the first and largest cryptocurrency by market cap. It was created in 2009 by Satoshi Nakamoto. On QTBM BANK, you can trade BTC against USDT, BNB, and ETH pairs. Always remember: crypto investments carry risk, so never invest more than you can afford to lose.',
  trade: 'To start trading on QTBM BANK: 1) Create and verify your account, 2) Deposit funds (crypto or fiat via P2P), 3) Navigate to the Trade page, 4) Select your trading pair, 5) Choose Market or Limit order, 6) Set your amount and confirm. We support spot, margin (3x-5x), and futures (up to 125x) trading.',
  security: 'Security best practices on QTBM BANK: 1) Enable Two-Factor Authentication (2FA), 2) Complete KYC verification, 3) Use a strong, unique password, 4) Never share your API keys, 5) Verify deposit/withdrawal addresses carefully, 6) Enable withdrawal whitelist, 7) Be cautious of phishing attempts. Your security is our top priority!',
  defi: 'DeFi (Decentralized Finance) refers to financial services built on blockchain technology, operating without traditional intermediaries. Key DeFi concepts include: liquidity pools, yield farming, lending/borrowing protocols, and decentralized exchanges. While DeFi offers exciting opportunities, it also carries significant risks including smart contract vulnerabilities and impermanent loss.',
  earn: 'QTBM BANK Earn allows you to earn passive income on your crypto holdings. We offer: Flexible products (withdraw anytime), Locked products (higher APR, fixed duration), and Staking. Current APRs range from 1% to 12% depending on the asset and product type. You can subscribe from as little as $1 worth of crypto.',
  fees: 'QTBM BANK fee structure: Spot trading: 0.1% maker/taker (reduced with VIP levels), Margin trading: 0.1% + interest rate, Futures trading: 0.02% maker / 0.04% taker, Deposits: Free, Withdrawals: Network fee varies by blockchain. Use BNB to pay fees for a 25% discount!',
};

function getFallbackResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const [key, response] of Object.entries(fallbackResponses)) {
    if (lower.includes(key)) return response;
  }
  return 'I appreciate your question! As a QTBM BANK AI assistant, I can help you with trading, platform features, security, and crypto education. Could you please be more specific about what you\'d like to know? For example, you can ask about trading, earning, security tips, or specific cryptocurrencies.';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Build the message list with system prompt including live prices
    const livePricesStr = getLivePricesString();
    const SYSTEM_PROMPT = `${BASE_SYSTEM_PROMPT}\n\nCurrent live prices on QTBM BANK (updated just now):\n${livePricesStr}\n\nWhen users ask about current prices, use these live prices. Always mention that prices are subject to change and encourage users to check the trading page for real-time data.`;

    const chatMessages = [
      { role: 'assistant' as const, content: SYSTEM_PROMPT },
      ...messages.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: m.content,
      })),
    ];

    try {
      const zai = await getZAI();
      const completion = await zai.chat.completions.create({
        messages: chatMessages,
        thinking: { type: 'disabled' },
      });

      const aiResponse = completion.choices[0]?.message?.content;

      if (aiResponse && aiResponse.trim().length > 0) {
        return NextResponse.json({ message: aiResponse });
      }
    } catch (aiError) {
      console.error('AI SDK error, using fallback:', aiError);
    }

    // Fallback to predefined responses
    const lastUserMessage = messages.filter((m: { role: string }) => m.role === 'user').pop();
    const fallbackMessage = lastUserMessage
      ? getFallbackResponse(lastUserMessage.content)
      : 'Hello! I\'m QTBM AI. How can I help you today?';

    return NextResponse.json({ message: fallbackMessage });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
