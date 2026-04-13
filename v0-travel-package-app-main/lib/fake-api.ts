'use client'

import { cities, places, Place, City, Transport } from './seeds/index'

// Seeded random for reproducibility
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Simple fuzzy search
function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase()
  const t = target.toLowerCase()

  if (t === q) return 100
  if (t.includes(q)) return 80
  if (q.includes(t)) return 60

  let score = 0
  let targetIdx = 0
  for (let i = 0; i < q.length; i++) {
    const idx = t.indexOf(q[i], targetIdx)
    if (idx === -1) return 0
    targetIdx = idx + 1
    score += 1
  }
  return score * (query.length / target.length) * 50
}

interface DataStore {
  cities: Map<string, City>
  places: Map<string, Place>
  bookmarks: Set<string>
}

const store: DataStore = {
  cities: new Map(),
  places: new Map(),
  bookmarks: new Set(),
}

// Initialize store
function initStore() {
  cities.forEach((city) => store.cities.set(city.id, city))
  places.forEach((place) => store.places.set(place.id, place))

  // Load bookmarks from localStorage
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('wanderwell-bookmarks')
      if (saved) {
        JSON.parse(saved).forEach((id: string) => store.bookmarks.add(id))
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }
}

// Simulate network latency
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomLatency(): number {
  return Math.random() * 300 + 120
}

// Generate transport prices deterministically based on seed
function generateTransportPrices(
  fromCity: string,
  toCity: string,
  date: string,
  type: 'flight' | 'train'
): Transport[] {
  const seed = `${fromCity}-${toCity}-${date}`.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const operators = type === 'flight' ? ['IndiAir', 'SpiceJet', 'AirIndia'] : ['Rajdhani', 'Shatabdi', 'Local Express']

  return operators.map((op, i) => {
    const baseSeed = seed + i
    const rand = seededRandom(baseSeed)

    const basePrice = type === 'flight' ? 3500 : 500
    const spread = type === 'flight' ? 3000 : 800
    const durationVariance = type === 'flight' ? 60 : 120

    return {
      routeKey: `${fromCity}-${toCity}-${date}`,
      type,
      operator: op,
      durationMin: (type === 'flight' ? 120 : 360) + Math.floor(rand * durationVariance),
      priceINR: Math.floor(basePrice + rand * spread),
      seatsLeft: Math.floor(5 + rand * 45),
      date,
    }
  })
}

// Main API handler
export const fakeApi = {
  async fetch(endpoint: string, params: Record<string, any> = {}) {
    await sleep(randomLatency())

    // Parse endpoint
    const parts = endpoint.split('/')

    if (endpoint === '/cities') {
      return {
        data: Array.from(store.cities.values()),
        meta: { total: store.cities.size, hasMore: false },
      }
    }

    if (parts[1] === 'cities' && parts[2]) {
      const cityId = parts[2]

      if (!parts[3]) {
        // GET /cities/:id
        const city = store.cities.get(cityId)
        if (!city) return { data: null, meta: { error: 'City not found' } }
        return { data: city, meta: { cached: false } }
      }

      if (parts[3] === 'places') {
        // GET /cities/:id/places
        const cityPlaces = Array.from(store.places.values()).filter((p) => p.cityId === cityId)

        let filtered = cityPlaces

        // Filter by type
        if (params.type) {
          filtered = filtered.filter((p) => p.type === params.type)
        }

        // Search/filter by query
        if (params.query) {
          const q = params.query.toLowerCase()
          filtered = filtered
            .map((p) => ({
              place: p,
              score: Math.max(
                fuzzyScore(q, p.name),
                Math.max(...p.tags.map((tag) => fuzzyScore(q, tag)))
              ),
            }))
            .filter((x) => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .map((x) => x.place)
        }

        // Sort
        if (params.sort === 'rating-desc') {
          filtered.sort((a, b) => b.rating - a.rating)
        } else if (params.sort === 'price-asc') {
          filtered.sort((a, b) => (a.priceRange?.min ?? 0) - (b.priceRange?.min ?? 0))
        }

        // Pagination
        const page = params.page ?? 1
        const limit = params.limit ?? 20
        const start = (page - 1) * limit
        const end = start + limit

        return {
          data: filtered.slice(start, end),
          meta: {
            total: filtered.length,
            page,
            limit,
            hasMore: end < filtered.length,
          },
        }
      }
    }

    if (parts[1] === 'place') {
      // GET /place/:id
      const placeId = parts[2]
      const place = store.places.get(placeId)
      if (!place) return { data: null, meta: { error: 'Place not found' } }
      return { data: place, meta: { cached: false } }
    }

    if (parts[1] === 'transport' && parts[2] === 'search') {
      // GET /transport/search
      const { from, to, date, type } = params
      if (!from || !to || !date) {
        return { data: [], meta: { error: 'Missing required params' } }
      }

      const typeFilter = type ? [type] : ['flight', 'train']
      const results: Transport[] = []

      typeFilter.forEach((t) => {
        results.push(...generateTransportPrices(from, to, date, t as 'flight' | 'train'))
      })

      return {
        data: results,
        meta: { total: results.length, timestamp: new Date().toISOString() },
      }
    }

    if (endpoint === '/itinerary/generate') {
      // POST /itinerary/generate
      const { cityId, days, pace, interests } = params
      const cityPlaces = Array.from(store.places.values()).filter((p) => p.cityId === cityId)

      const sights = cityPlaces
        .filter((p) => p.type === 'sight' && interests.some((tag: string) => p.tags.includes(tag)))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, Math.min(days * 2, 10))

      const restaurants = cityPlaces.filter((p) => p.type === 'restaurant').sort((a, b) => b.rating - a.rating)

      const itinerary: any[] = []
      const hoursPerDay = pace === 'packed' ? 12 : pace === 'normal' ? 10 : 8

      for (let day = 1; day <= days; day++) {
        const daySchedule: any[] = []
        let currentTime = 9 // Start at 9 AM
        let placesForDay = sights.slice((day - 1) * 2, day * 2)

        // Add places
        placesForDay.forEach((place) => {
          const duration = place.bestTimeMinutes / 60
          daySchedule.push({
            type: 'sight',
            name: place.name,
            startTime: `${String(currentTime).padStart(2, '0')}:00`,
            duration: duration,
            place: place.id,
          })
          currentTime += duration + 1 // 1 hour travel time
        })

        // Add lunch
        if (currentTime < 12) currentTime = 12
        const lunchRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)]
        daySchedule.push({
          type: 'meal',
          meal: 'lunch',
          startTime: `${String(currentTime).padStart(2, '0')}:00`,
          restaurant: lunchRestaurant.id,
          name: lunchRestaurant.name,
        })
        currentTime += 1.5

        // Add dinner
        if (currentTime < 18) currentTime = 18
        const dinnerRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)]
        daySchedule.push({
          type: 'meal',
          meal: 'dinner',
          startTime: `${String(currentTime).padStart(2, '0')}:00`,
          restaurant: dinnerRestaurant.id,
          name: dinnerRestaurant.name,
        })

        itinerary.push({
          day,
          schedule: daySchedule,
        })
      }

      return {
        data: {
          id: `itinerary-${Date.now()}`,
          cityId,
          days,
          pace,
          interests,
          itinerary,
          createdAt: new Date().toISOString(),
        },
        meta: { generated: true },
      }
    }

    return { data: null, meta: { error: 'Endpoint not found' } }
  },

  // Bookmark management
  addBookmark(placeId: string) {
    store.bookmarks.add(placeId)
    this.persistBookmarks()
  },

  removeBookmark(placeId: string) {
    store.bookmarks.delete(placeId)
    this.persistBookmarks()
  },

  getBookmarks() {
    return Array.from(store.bookmarks)
  },

  isBookmarked(placeId: string) {
    return store.bookmarks.has(placeId)
  },

  persistBookmarks() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('wanderwell-bookmarks', JSON.stringify(Array.from(store.bookmarks)))
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  },
}

// Initialize on first import
if (typeof window !== 'undefined') {
  initStore()
}
