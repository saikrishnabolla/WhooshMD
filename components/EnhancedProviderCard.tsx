"use client"

import React, { useState } from "react"
import { Phone, MapPin, Clock, CheckCircle, AlertCircle, Loader2, User, Building2, Calendar } from "lucide-react"
// Simple inline components since we don't have a full UI library
const Badge = ({ children, variant = "default", className = "" }: { 
  children: React.ReactNode, 
  variant?: "default" | "secondary" | "outline", 
  className?: string 
}) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800", 
    outline: "border border-gray-300 text-gray-700 bg-white"
  }
  return <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>{children}</span>
}

const Button = ({ children, variant = "default", size = "default", className = "", asChild, onClick, ...props }: {
  children: React.ReactNode,
  variant?: "default" | "outline" | "secondary",
  size?: "default" | "sm" | "lg", 
  className?: string,
  asChild?: boolean,
  onClick?: () => void,
  [key: string]: unknown
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors"
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200"
  }
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 py-1",
    lg: "h-12 px-6 py-3"
  }
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      className: `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
    })
  }
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

const Separator = ({ className = "" }: { className?: string }) => (
  <div className={`h-[1px] w-full bg-gray-200 ${className}`} />
)

interface NPIProvider {
  number: string
  enumeration_type: string
  basic: {
    first_name?: string
    last_name?: string
    organization_name?: string
    credential?: string
    sole_proprietor?: string
    gender?: string
    enumeration_date?: string
    last_updated?: string
    status?: string
  }
  addresses: Array<{
    country_code: string
    country_name: string
    address_purpose: string
    address_type: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postal_code: string
    telephone_number?: string
    fax_number?: string
  }>
  taxonomies: Array<{
    code: string
    desc: string
    primary: boolean
    state?: string
    license?: string
    taxonomy_group?: string
  }>
}

interface CallResult {
  provider_npi: string
  phone_number: string
  status: "calling" | "completed" | "failed"
  availability_status?: string
  availability_details?: string
  summary?: string
  sentiment?: string
  call_date?: string
  recording_url?: string
}

interface AvailabilityInfo {
  acceptingNewPatients: boolean
  nextAvailable: string | null
  specialNotes: string[]
}

interface EnhancedProviderCardProps {
  provider: NPIProvider
  callResult?: CallResult
  isSelected?: boolean
  onSelectionChange?: (npi: string, checked: boolean) => void
  canSelect?: boolean
  onViewDetails?: (provider: NPIProvider) => void
}

export function EnhancedProviderCard({ 
  provider, 
  callResult, 
  onViewDetails 
}: EnhancedProviderCardProps) {
  const [showFullSummary, setShowFullSummary] = useState(false)

  // Get provider name
  const providerName =
    provider.enumeration_type === "NPI-1"
      ? `${provider.basic.first_name || ""} ${provider.basic.last_name || ""}`.trim()
      : provider.basic.organization_name || "Unknown Provider"

  // Get primary specialty
  const primarySpecialty =
    provider.taxonomies.find((t) => t.primary)?.desc || provider.taxonomies[0]?.desc || "General Practice"

  // Get practice address (prefer practice location over mailing)
  const practiceAddress =
    provider.addresses.find((addr) => addr.address_purpose === "LOCATION") || provider.addresses[0]
  const fullAddress = practiceAddress
    ? `${practiceAddress.address_1}${practiceAddress.address_2 ? `, ${practiceAddress.address_2}` : ""}, ${practiceAddress.city}, ${practiceAddress.state} ${practiceAddress.postal_code}`
    : "Address not available"

  // Get phone number
  const phoneNumber = provider.addresses.find((addr) => addr.telephone_number)?.telephone_number

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  // Parse availability details
  const parseAvailabilityDetails = (details: string | undefined): AvailabilityInfo | null => {
    if (!details) return null

    try {
      const lines = details.split("\n").filter((line) => line.trim())
      const parsed: AvailabilityInfo = {
        acceptingNewPatients: false,
        nextAvailable: null,
        specialNotes: [],
      }

      lines.forEach((line) => {
        const lower = line.toLowerCase()
        if (lower.includes("accepting new patients") || lower.includes("taking new patients")) {
          parsed.acceptingNewPatients = !lower.includes("not") && !lower.includes("n't")
        }
        if (lower.includes("next available") || lower.includes("earliest") || lower.includes("appointment")) {
          const dateMatch = line.match(/(\w+\s+\d{1,2}|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2})/i)
          if (dateMatch) {
            parsed.nextAvailable = dateMatch[0]
          }
        }
        if (lower.includes("note") || lower.includes("special") || lower.includes("requirement")) {
          parsed.specialNotes.push(line)
        }
      })

      return parsed
    } catch {
      return null
    }
  }

  const availabilityInfo = parseAvailabilityDetails(callResult?.availability_details)

  // Truncate summary for display
  const truncatedSummary = callResult?.summary
    ? callResult.summary.length > 150
      ? callResult.summary.substring(0, 150) + "..."
      : callResult.summary
    : undefined

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-6">
        {/* Header with provider info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            {provider.enumeration_type === "NPI-1" ? (
              <User className="w-6 h-6 text-blue-600" />
            ) : (
              <Building2 className="w-6 h-6 text-blue-600" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-1">
              {providerName}
            </h3>
            {provider.basic.credential && (
              <p className="text-sm text-gray-600 font-medium">{provider.basic.credential}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                {primarySpecialty}
              </Badge>
              <Badge variant="outline" className="text-gray-600 border-gray-300 text-xs">
                {provider.enumeration_type === "NPI-1" ? "Individual" : "Organization"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">{fullAddress}</span>
          </div>
          {phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="font-medium">{formatPhoneNumber(phoneNumber)}</span>
            </div>
          )}
        </div>

        {/* NPI Status */}
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-gray-700">NPI: {provider.number} • Verified</span>
        </div>

        {/* Call Result Status */}
        {callResult && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              {/* Call Status Header */}
              <div className="flex items-center gap-2">
                {callResult.status === "calling" && (
                  <>
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-sm font-medium text-blue-700">AI verification in progress...</span>
                  </>
                )}
                {callResult.status === "completed" && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">AI verified recently</span>
                    {callResult.call_date && (
                      <span className="text-xs text-gray-500">
                        • {new Date(callResult.call_date).toLocaleDateString()}
                      </span>
                    )}
                  </>
                )}
                {callResult.status === "failed" && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">Verification failed</span>
                  </>
                )}
              </div>

              {/* Availability Display */}
              {callResult.status === "completed" && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {/* Availability Status */}
                  {callResult.availability_status && (
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        availabilityInfo?.acceptingNewPatients 
                          ? 'bg-green-500' 
                          : callResult.availability_status.toLowerCase().includes('no') || 
                            callResult.availability_status.toLowerCase().includes('not')
                            ? 'bg-red-500' 
                            : 'bg-yellow-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-900">
                        {callResult.availability_status}
                      </span>
                    </div>
                  )}

                  {/* Next Available */}
                  {availabilityInfo?.nextAvailable && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Next available: {availabilityInfo.nextAvailable}</span>
                    </div>
                  )}

                  {/* Summary */}
                  {callResult.summary && (
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-1">Summary:</p>
                      <p className="leading-relaxed">
                        {showFullSummary ? callResult.summary : truncatedSummary}
                        {callResult.summary.length > 150 && (
                          <button
                            onClick={() => setShowFullSummary(!showFullSummary)}
                            className="text-blue-600 hover:text-blue-700 ml-1 font-medium text-xs"
                          >
                            {showFullSummary ? "Show less" : "Show more"}
                          </button>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Special Notes */}
                  {availabilityInfo?.specialNotes && availabilityInfo.specialNotes.length > 0 && (
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 mb-1">Notes:</p>
                      <ul className="text-gray-700 space-y-1">
                        {availabilityInfo.specialNotes.map((note, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="leading-relaxed">{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
          {phoneNumber && (
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
            >
              <a href={`tel:${phoneNumber}`}>
                <Phone className="w-4 h-4 mr-2" />
                Book Now
              </a>
            </Button>
          )}
          {onViewDetails && (
            <Button 
              variant="outline" 
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={() => onViewDetails(provider)}
            >
              View Profile
            </Button>
          )}
          {callResult?.recording_url && (
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={() => window.open(callResult.recording_url, '_blank')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Listen to Call
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedProviderCard