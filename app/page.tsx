'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Compass, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fakeApi } from '@/lib/fake-api'
import { City, cities as allCities, places as allPlaces } from '@/lib/seeds'
import { Card } from '@/components/ui/card'

export default function Page() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<City[]>([])
  const [searchAttempted, setSearchAttempted] = useState(false)

  // FIX 8: derive counts dynamically from seed data instead of hardcoding
  const cityCount = allCities.length
  const placeCount = allPlaces.length
  const regionCount = new Set(allCities.map((c) => c.region)).size

  useEffect(() => {
    const loadCities = async () => {
      const result = await fakeApi.fetch('/cities')
      setCities(result.data || [])
      setLoading(false)
    }
    loadCities()
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      setSearchAttempted(true)
      const filtered = cities.filter(
        (city) =>
          city.name.toLowerCase().includes(query.toLowerCase()) ||
          city.region.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filtered)
    } else {
      setSearchAttempted(false)
      setSearchResults([])
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-background via-background to-muted">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg group-hover:scale-110 transition-transform">
              W
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:inline">Wanderwell</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/bookmarks">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Bookmarks
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Discover India's <span className="text-primary">Most Vibrant</span> Cities
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore hand-curated hotels, restaurants, attractions and create personalized itineraries for your perfect trip.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
              <Input
                type="text"
                placeholder="Where are you going?"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 pr-4 py-3 text-base rounded-full border-2 border-primary/20 focus:border-primary bg-card text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* FIX 1: Search Results Dropdown with empty state */}
            {searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg border border-border shadow-lg z-40 overflow-hidden">
                {searchResults.length > 0 ? (
                  searchResults.map((city) => (
                    <Link
                      key={city.id}
                      href={`/city/${city.id}`}
                      className="block px-4 py-3 hover:bg-muted border-b border-border last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="text-left">
                          <p className="font-medium text-foreground">{city.name}</p>
                          <p className="text-sm text-muted-foreground">{city.region}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-5 text-center">
                    <p className="font-medium text-foreground text-sm">
                      No cities found for &quot;{searchQuery}&quot;
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try Delhi, Mumbai or Goa
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FIX 8: Dynamic stats from seed data */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{cityCount}</div>
              <p className="text-sm text-muted-foreground">Cities</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{placeCount}+</div>
              <p className="text-sm text-muted-foreground">Places</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{regionCount}</div>
              <p className="text-sm text-muted-foreground">Regions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cities Carousel */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Recommended Cities</h2>
            <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
              View all →
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <>
                <div className="h-64 bg-muted rounded-xl animate-pulse" />
                <div className="h-64 bg-muted rounded-xl animate-pulse" />
                <div className="h-64 bg-muted rounded-xl animate-pulse" />
              </>
            ) : (
              cities.map((city) => (
                <Link key={city.id} href={`/city/${city.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group h-64 flex flex-col">
                    <div
                      className="flex-1 bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden"
                      style={{
                        backgroundImage: `url(${city.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent group-hover:from-foreground/60 transition-colors" />
                      <div className="absolute inset-0 flex flex-col justify-end p-4 text-card">
                        <h3 className="text-2xl font-bold">{city.name}</h3>
                        <p className="text-sm text-card/80">{city.region}</p>
                      </div>
                    </div>
                    <div className="p-4 border-t border-border bg-card">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {city.bestTimeToVisit}
                        </span>
                        <span>₹{city.avgPrice.min.toLocaleString()} - ₹{city.avgPrice.max.toLocaleString()}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From accommodation to dining, attractions to itineraries - we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🏨', title: 'Hotels', desc: 'Curated accommodations' },
              { icon: '🍽️', title: 'Restaurants', desc: 'Local dining gems' },
              { icon: '🎯', title: 'Attractions', desc: 'Must-see places' },
              { icon: '🗺️', title: 'Itineraries', desc: 'Auto-generated plans' },
            ].map((feature) => (
              <Card key={feature.title} className="p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3 flex justify-center">{feature.icon}</div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Ready to Explore?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start planning your next adventure. Choose a city and discover amazing experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href={`/city/delhi`} className="flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Start Exploring
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#cities" className="flex items-center gap-2">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FIX 10: Dynamic copyright year */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Wanderwell. Discover India&apos;s vibrant cities.</p>
        </div>
      </footer>
    </div>
  )
}
