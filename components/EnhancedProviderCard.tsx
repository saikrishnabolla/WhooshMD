"use client"

import React, { useState } from "react"
import { Phone, MapPin, Clock, CheckCircle, AlertCircle, Loader2, User, Building2, Calendar, CreditCard, UserCheck, FileText } from "lucide-react"
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
  // New extracted variables fields
  extracted_variables?: string
  clinic_name?: string
  contact_person?: string
  insurance_accepted?: string
  appointment_types_available?: string
  availability_timeframe?: string
  specific_availability?: string
  call_outcome_quality?: string
  clinic_phone_verified?: string
  follow_up_needed?: string
  callback_instructions?: string
  additional_requirements?: string
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
  const [showExtractedDetails, setShowExtractedDetails] = useState(false)

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
        {/* Header with provider info - Fixed spacing to prevent overlap */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            {provider.enumeration_type === "NPI-1" ? (
              <User className="w-6 h-6 text-blue-600" />
            ) : (
              <Building2 className="w-6 h-6 text-blue-600" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-2">
              {providerName}
            </h3>
            {provider.basic.credential && (
              <p className="text-sm text-gray-600 font-medium mb-3">{provider.basic.credential}</p>
            )}
            
            {/* Fixed badges layout to prevent overlap */}
            <div className="flex flex-col gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  {primarySpecialty}
                </Badge>
                <Badge variant="outline" className="text-gray-600 border-gray-300 text-xs">
                  {provider.enumeration_type === "NPI-1" ? "Individual" : "Organization"}
                </Badge>
              </div>
              
              {/* Availability status badge - separated to prevent overlap */}
              {callResult?.availability_status && (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    callResult.availability_status.toLowerCase().includes('accepting') || 
                    callResult.availability_status.toLowerCase().includes('available')
                      ? 'bg-green-500' 
                      : callResult.availability_status.toLowerCase().includes('no') || 
                        callResult.availability_status.toLowerCase().includes('not')
                        ? 'bg-red-500' 
                        : 'bg-yellow-500'
                  }`} />
                  <Badge 
                    variant={
                      callResult.availability_status.toLowerCase().includes('accepting') || 
                      callResult.availability_status.toLowerCase().includes('available')
                        ? "default"
                        : "secondary"
                    } 
                    className={`text-xs ${
                      callResult.availability_status.toLowerCase().includes('accepting') || 
                      callResult.availability_status.toLowerCase().includes('available')
                        ? "bg-green-100 text-green-800 border-green-200"
                        : callResult.availability_status.toLowerCase().includes('no') || 
                          callResult.availability_status.toLowerCase().includes('not')
                          ? "bg-red-100 text-red-800 border-red-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                    }`}
                  >
                    <UserCheck className="w-3 h-3 mr-1" />
                    {callResult.availability_status}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-3 text-sm text-gray-600 mb-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">{fullAddress}</span>
          </div>
          {phoneNumber && (
            <div className="flex items-center gap-3">
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
            <div className="space-y-4">
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

              {/* Enhanced Availability Display */}
              {callResult.status === "completed" && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  
                  {/* Key Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Clinic Information */}
                    {callResult.clinic_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">Clinic:</span>
                        <span className="text-gray-700">{callResult.clinic_name}</span>
                      </div>
                    )}

                    {/* Insurance Information */}
                    {callResult.insurance_accepted && (
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">Insurance:</span>
                        <span className="text-gray-700">{callResult.insurance_accepted}</span>
                      </div>
                    )}

                    {/* Contact Person */}
                    {callResult.contact_person && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">Contact:</span>
                        <span className="text-gray-700">{callResult.contact_person}</span>
                      </div>
                    )}

                    {/* Phone Verification */}
                    {callResult.clinic_phone_verified && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">Phone:</span>
                        <span className="text-gray-700">{callResult.clinic_phone_verified}</span>
                      </div>
                    )}
                  </div>

                  {/* Availability Information */}
                  {(callResult.availability_timeframe || callResult.specific_availability) && (
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-900">Availability:</span>
                          <div className="mt-1 space-y-1">
                            {callResult.availability_timeframe && (
                              <p className="text-gray-700">Timeframe: {callResult.availability_timeframe}</p>
                            )}
                            {callResult.specific_availability && (
                              <p className="text-gray-700">Hours: {callResult.specific_availability}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Appointment Types */}
                  {callResult.appointment_types_available && (
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Appointments:</span>
                        <span className="ml-1">{callResult.appointment_types_available}</span>
                      </div>
                    </div>
                  )}

                  {/* Call Quality Indicator */}
                  {callResult.call_outcome_quality && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        callResult.call_outcome_quality.toLowerCase().includes('good') ||
                        callResult.call_outcome_quality.toLowerCase().includes('complete')
                          ? 'bg-green-100 text-green-800'
                          : callResult.call_outcome_quality.toLowerCase().includes('limited')
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        Call Quality: {callResult.call_outcome_quality}
                      </span>
                    </div>
                  )}

                  {/* Summary */}
                  {callResult.summary && (
                    <div className="border-t border-gray-200 pt-3">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 mb-2">Call Summary:</p>
                        <p className="text-gray-700 leading-relaxed">
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
                    </div>
                  )}

                  {/* Additional Details Toggle */}
                  {(callResult.additional_requirements || callResult.follow_up_needed || callResult.callback_instructions) && (
                    <div className="border-t border-gray-200 pt-3">
                      <button
                        onClick={() => setShowExtractedDetails(!showExtractedDetails)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {showExtractedDetails ? "Hide" : "Show"} Additional Details
                      </button>
                      
                      {showExtractedDetails && (
                        <div className="mt-3 space-y-2 text-sm text-gray-700">
                          {callResult.additional_requirements && (
                            <p><strong>Requirements:</strong> {callResult.additional_requirements}</p>
                          )}
                          {callResult.follow_up_needed && (
                            <p><strong>Follow-up:</strong> {callResult.follow_up_needed}</p>
                          )}
                          {callResult.callback_instructions && (
                            <p><strong>Callback:</strong> {callResult.callback_instructions}</p>
                          )}
                        </div>
                      )}
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