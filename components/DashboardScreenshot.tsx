'use client'

import { Users, Calendar, FileText, TrendingUp, Bell, Moon, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function DashboardScreenshot() {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current || !contentRef.current) return

      const container = containerRef.current
      const content = contentRef.current

      // Taille de référence du dashboard (1920x1080 par exemple)
      const referenceWidth = 1920
      const referenceHeight = 1080

      // Taille du conteneur
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      // Calculer le ratio de scale pour s'adapter au conteneur
      const scaleX = containerWidth / referenceWidth
      const scaleY = containerHeight / referenceHeight
      const newScale = Math.min(scaleX, scaleY) * 0.95 // 95% pour laisser un peu de marge

      setScale(newScale)
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-[#F5F5F5] flex items-center justify-center overflow-hidden"
      style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
    >
      <div
        ref={contentRef}
        className="flex origin-top-left"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: '1920px',
          height: '1080px',
        }}
      >
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">ArtisanPro</h2>
            <p className="text-xs text-gray-500">Gestion professionnelle</p>
          </div>
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-3" style={{ backgroundColor: 'rgba(150, 185, 220, 0.1)', color: 'rgb(150, 185, 220)' }}>
              <Calendar className="w-4 h-4" />
              Tableau de bord
            </div>
            <div className="px-3 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-3 hover:bg-gray-50">
              <Users className="w-4 h-4" />
              Clients
            </div>
            <div className="px-3 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-3 hover:bg-gray-50">
              <Calendar className="w-4 h-4" />
              Planning
            </div>
            <div className="px-3 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-3 hover:bg-gray-50">
              <TrendingUp className="w-4 h-4" />
              Géolocalisation
            </div>
            <div className="px-3 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-3 hover:bg-gray-50">
              <FileText className="w-4 h-4" />
              Devis
            </div>
            <div className="px-3 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-3 hover:bg-gray-50">
              <FileText className="w-4 h-4" />
              Factures
            </div>
            <div className="px-3 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-3 hover:bg-gray-50">
              <TrendingUp className="w-4 h-4" />
              Dépenses
            </div>
            <div className="px-3 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-3 hover:bg-gray-50">
              <TrendingUp className="w-4 h-4" />
              Finances
            </div>
            <div className="px-3 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-3 hover:bg-gray-50">
              <FileText className="w-4 h-4" />
              Stock
            </div>
            <div className="px-3 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-3 hover:bg-gray-50 relative">
              <Bell className="w-4 h-4" />
              Notifications
              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">8</span>
            </div>
          </nav>
          <div className="p-2 border-t border-gray-200 space-y-1">
            <div className="px-3 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-3 hover:bg-gray-50">
              <Moon className="w-4 h-4" />
              Thème
            </div>
            <div className="px-3 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-3 hover:bg-gray-50">
              <LogOut className="w-4 h-4" />
              Déconnexion
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-[#F5F5F5]">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-sm text-gray-500">Vue d'ensemble de votre activité</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Facture</button>
                <button className="px-4 py-2 text-sm rounded-lg text-white" style={{ backgroundColor: 'rgb(150, 185, 220)' }}>Intervention</button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(150, 185, 220, 0.1)' }}>
                    <Users className="w-5 h-5" style={{ color: 'rgb(150, 185, 220)' }} />
                  </div>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    ↗ +12%
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">50</div>
                <div className="text-xs text-gray-500">Clients actifs</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                    <Calendar className="w-5 h-5 text-gray-700" />
                  </div>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    ↗ +5
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
                <div className="text-xs text-gray-500">À venir cette semaine</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-xs text-red-600 flex items-center gap-1">
                    ↘ -11%
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">2 540,43 €</div>
                <div className="text-xs text-gray-500">Ce mois-ci</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-yellow-100">
                    <FileText className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    ↗ 11 en attente
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">11</div>
                <div className="text-xs text-gray-500">En attente de paiement</div>
              </div>
            </div>

            {/* Calendar Heatmap */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Carte d'activité mensuelle</h3>
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-sm font-medium text-gray-700">décembre 2025</span>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                  <div key={day} className="text-xs text-gray-500 text-center py-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => {
                  const day = i + 1
                  const activity = day === 1 ? 2 : day === 9 ? 3 : day === 16 ? 1 : day === 31 ? 0 : Math.floor(Math.random() * 2)
                  const intensity = activity === 0 ? 0 : activity === 1 ? 0.3 : activity === 2 ? 0.6 : 0.9
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded text-xs flex items-center justify-center border ${
                        day === 31 ? 'border-2' : 'border-transparent'
                      }`}
                      style={{
                        backgroundColor: intensity > 0 ? `rgba(34, 197, 94, ${intensity})` : '#F5F5F5',
                        borderColor: day === 31 ? 'rgb(150, 185, 220)' : 'transparent',
                        color: intensity > 0.5 ? 'white' : 'gray'
                      }}
                    >
                      {day <= 31 ? day : ''}
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                <span>Moins</span>
                <div className="flex gap-1">
                  {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, i) => (
                    <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: `rgba(34, 197, 94, ${opacity})` }} />
                  ))}
                </div>
                <span>Plus</span>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left: Operations */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Opérations en cours</h3>
                    <p className="text-xs text-gray-500">Vue d'ensemble</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-red-500">⚠</span>
                    <h4 className="text-sm font-semibold text-gray-900">Factures en retard (11)</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="text-sm font-medium text-gray-900">#FAC-0004</div>
                      <div className="text-xs text-gray-600">Christophe Mercier 49</div>
                      <div className="text-xs font-semibold text-gray-900 mt-1">492,92 €</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="text-sm font-medium text-gray-900">#FAC-0006</div>
                      <div className="text-xs text-gray-600">Céline Girard 21</div>
                      <div className="text-xs font-semibold text-gray-900 mt-1">1355,26 €</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Revenue Chart */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Revenus</h3>
                    <p className="text-xs text-gray-500">Évolution sur 6 derniers mois</p>
                  </div>
                </div>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[40, 60, 80, 70, 50, 45].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end">
                      <div
                        className="w-full rounded-t"
                        style={{
                          height: `${height}%`,
                          backgroundColor: 'rgb(150, 185, 220)',
                          background: `linear-gradient(to top, rgb(150, 185, 220), rgba(150, 185, 220, 0.3))`
                        }}
                      />
                      <div className="text-xs text-gray-500 mt-2">{i + 1}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                  <span>1700</span>
                  <span>2550</span>
                  <span>3400</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
