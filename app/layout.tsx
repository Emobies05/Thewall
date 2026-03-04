import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TheWall - Web3 Crypto Wallet',
  description: 'TheWall Web3 Portfolio Tracker - ETH, USDC, USDT and more',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
