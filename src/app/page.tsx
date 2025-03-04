import { CryptoDashboard } from "@/components/crypto-dashboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">Crypto Dashboard</h1>
        <CryptoDashboard />
      </div>
    </main>
  )
}

