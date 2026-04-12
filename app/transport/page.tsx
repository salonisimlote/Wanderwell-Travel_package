'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Plane, Train } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { fakeApi } from '@/lib/fake-api'
import { cities, Transport } from '@/lib/seeds'

export default function TransportPage() {
  const [fromCity, setFromCity] = useState('')
  const [toCity, setToCity] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [results, setResults] = useState<Transport[]>([])
  const [loading, setLoading] = useState(false)
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)

  const searchTransport = async () => {
    if (!fromCity || !toCity || !date) return

    setLoading(true)
    const result = await fakeApi.fetch('/transport/search', {
      from: fromCity,
      to: toCity,
      date,
      type: 'flight', // Can add support for both
    })
    setResults(result.data || [])
    setLoading(false)
  }

  const cityOptions = cities.map((c) => c.id)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Plane className="w-5 h-5" />
            Transport
          </h1>
        </div>
      </nav>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Book Your Journey</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* From City */}
            <div className="relative">
              <label className="text-sm font-medium text-foreground block mb-2">From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value.toUpperCase())}
                  onFocus={() => setShowFromDropdown(true)}
                  onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
                  placeholder="City code"
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground"
                  maxLength={3}
                />
                {showFromDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10">
                    {cityOptions
                      .filter((c) => c.includes(fromCity.toLowerCase()))
                      .map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setFromCity(c.toUpperCase())
                            setShowFromDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg text-foreground"
                        >
                          {c.toUpperCase()}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* To City */}
            <div className="relative">
              <label className="text-sm font-medium text-foreground block mb-2">To</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value.toUpperCase())}
                  onFocus={() => setShowToDropdown(true)}
                  onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
                  placeholder="City code"
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground"
                  maxLength={3}
                />
                {showToDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10">
                    {cityOptions
                      .filter((c) => c.includes(toCity.toLowerCase()) && c !== fromCity.toLowerCase())
                      .map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setToCity(c.toUpperCase())
                            setShowToDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg text-foreground"
                        >
                          {c.toUpperCase()}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-card text-foreground"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button
                onClick={searchTransport}
                disabled={loading || !fromCity || !toCity}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {results.length === 0 && !loading ? (
            <div className="text-center py-12 space-y-4">
              <Plane className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-bold text-foreground">
                {fromCity && toCity ? 'No options available' : 'Search for flights or trains'}
              </h2>
              <p className="text-muted-foreground">
                {fromCity && toCity
                  ? 'Try different dates or cities'
                  : 'Select departure and arrival cities to begin'}
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-foreground">
                {results.length} Option{results.length !== 1 ? 's' : ''} Available
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {results.map((transport) => (
                  <Card key={`${transport.routeKey}-${transport.operator}`} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {transport.type === 'flight' ? (
                            <Plane className="w-5 h-5 text-primary" />
                          ) : (
                            <Train className="w-5 h-5 text-primary" />
                          )}
                          <h3 className="font-bold text-lg text-foreground">{transport.operator}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {transport.type === 'flight' ? 'Flight' : 'Train'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">₹{transport.priceINR.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{transport.seatsLeft} seats left</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4 pb-4 border-b border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Duration</span>
                        <span className="font-medium text-foreground">{transport.durationMin} minutes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Route</span>
                        <span className="font-medium text-foreground">
                          {transport.routeKey.split('-').slice(0, 2).join(' → ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Date</span>
                        <span className="font-medium text-foreground">{transport.date}</span>
                      </div>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90">Book Now</Button>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
