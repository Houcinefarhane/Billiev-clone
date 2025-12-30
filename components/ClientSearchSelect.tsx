'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string
}

interface ClientSearchSelectProps {
  value: string
  onChange: (clientId: string) => void
  label?: string
  required?: boolean
  placeholder?: string
  className?: string
}

export default function ClientSearchSelect({
  value,
  onChange,
  label = 'Client',
  required = false,
  placeholder = 'Rechercher un client...',
  className = '',
}: ClientSearchSelectProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Charger tous les clients au montage
  useEffect(() => {
    fetchClients()
  }, [])

  // Gérer les clics en dehors du composant
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtrer les clients quand le terme de recherche change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients)
    } else {
      const search = searchTerm.toLowerCase()
      const filtered = clients.filter(
        (client) =>
          client.firstName.toLowerCase().includes(search) ||
          client.lastName.toLowerCase().includes(search) ||
          (client.email && client.email.toLowerCase().includes(search)) ||
          (client.phone && client.phone.includes(search))
      )
      setFilteredClients(filtered)
    }
  }, [searchTerm, clients])

  // Mettre à jour le champ de recherche quand la valeur change
  useEffect(() => {
    if (value) {
      const selectedClient = clients.find((c) => c.id === value)
      if (selectedClient) {
        setSearchTerm(`${selectedClient.firstName} ${selectedClient.lastName}`)
      }
    } else {
      setSearchTerm('')
    }
  }, [value, clients])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/clients?page=1&limit=1000')
      const data = await res.json()
      if (res.ok) {
        setClients(data.clients || [])
        setFilteredClients(data.clients || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectClient = (client: Client) => {
    onChange(client.id)
    setSearchTerm(`${client.firstName} ${client.lastName}`)
    setShowDropdown(false)
  }

  const handleClear = () => {
    onChange('')
    setSearchTerm('')
    setShowDropdown(false)
  }

  const selectedClient = clients.find((c) => c.id === value)

  return (
    <div className={`space-y-2 ${className}`} ref={containerRef}>
      {label && (
        <Label>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowDropdown(true)
              if (!e.target.value) {
                onChange('')
              }
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder}
            required={required && !value}
            className="pl-10 pr-10"
            disabled={loading}
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={handleClear}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Dropdown avec les suggestions */}
        {showDropdown && filteredClients.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className={`px-4 py-3 hover:bg-muted cursor-pointer transition-colors ${
                  value === client.id ? 'bg-muted' : ''
                }`}
                onClick={() => handleSelectClient(client)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {client.firstName} {client.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {client.phone && <span>{client.phone}</span>}
                      {client.email && client.phone && <span>•</span>}
                      {client.email && <span className="truncate">{client.email}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message si aucun résultat */}
        {showDropdown && searchTerm && filteredClients.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground">
            Aucun client trouvé
          </div>
        )}
      </div>

      {/* Affichage du client sélectionné */}
      {selectedClient && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <User className="w-3 h-3" />
          <span>
            Client sélectionné: {selectedClient.firstName} {selectedClient.lastName}
            {selectedClient.phone && ` • ${selectedClient.phone}`}
          </span>
        </div>
      )}
    </div>
  )
}

