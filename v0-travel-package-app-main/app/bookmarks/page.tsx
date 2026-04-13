'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bookmark, Download, Trash2, Star, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { fakeApi } from '@/lib/fake-api'
import { places as allPlaces } from '@/lib/seeds'
import { Place } from '@/lib/seeds'

export default function BookmarksPage() {
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBookmarks = async () => {
      const bookmarkIds = fakeApi.getBookmarks()
      const places = allPlaces.filter((p) => bookmarkIds.includes(p.id))
      setBookmarkedPlaces(places)
      setLoading(false)
    }

    loadBookmarks()
  }, [])

  const removeBookmark = (placeId: string) => {
    fakeApi.removeBookmark(placeId)
    setBookmarkedPlaces(bookmarkedPlaces.filter((p) => p.id !== placeId))
  }

  const exportBookmarks = () => {
    const data = {
      exportDate: new Date().toISOString(),
      bookmarks: bookmarkedPlaces.map((p) => ({
        id: p.id,
        name: p.name,
        city: p.cityId,
        type: p.type,
        rating: p.rating,
      })),
    }

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)))
    element.setAttribute('download', `wanderwell-bookmarks-${new Date().toISOString().split('T')[0]}.json`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

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
            <Bookmark className="w-5 h-5" />
            My Bookmarks
          </h1>
          {bookmarkedPlaces.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportBookmarks}
              className="ml-auto gap-2 bg-transparent"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          )}
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : bookmarkedPlaces.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Bookmark className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-bold text-foreground">No bookmarks yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start exploring cities and bookmark your favorite places to come back to them later.
            </p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">Explore Cities</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{bookmarkedPlaces.length} Bookmarked Places</h2>
                <p className="text-muted-foreground">Your saved travel destinations</p>
              </div>
            </div>

            {/* Group by type */}
            {['sight', 'restaurant', 'hotel'].map((type) => {
              const filtered = bookmarkedPlaces.filter((p) => p.type === type)
              if (filtered.length === 0) return null

              return (
                <div key={type} className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground capitalize">
                    {type === 'sight'
                      ? 'Things to Do'
                      : type === 'restaurant'
                        ? 'Restaurants'
                        : 'Hotels'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((place) => (
                      <Link key={place.id} href={`/place/${place.id}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-all h-full cursor-pointer group relative">
                          <div
                            className="h-40 bg-gradient-to-br from-primary/20 to-accent/20"
                            style={{
                              backgroundImage: `url(${place.image})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          >
                            <div className="w-full h-full bg-gradient-to-t from-foreground/30 to-transparent" />
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                removeBookmark(place.id)
                              }}
                              className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="p-4">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {place.name}
                            </h3>

                            <p className="text-xs text-muted-foreground mt-1">{place.cityId.toUpperCase()}</p>

                            <div className="flex items-center gap-2 mt-3 text-sm">
                              <Star className="w-4 h-4 fill-accent text-accent flex-shrink-0" />
                              <span className="font-medium text-foreground">{place.rating.toFixed(1)}</span>
                              <span className="text-muted-foreground">·</span>
                              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground">{place.bestTimeMinutes}m</span>
                            </div>

                            {place.priceRange && (
                              <div className="mt-3 pt-3 border-t border-border text-sm font-medium text-primary">
                                ₹{place.priceRange.min} - ₹{place.priceRange.max}
                              </div>
                            )}
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
