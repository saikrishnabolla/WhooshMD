'use client'

import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Calendar, 
  Shield, 
  MessageSquare, 
  Clock,
  Phone,
  Globe,
  User,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Provider } from '../types';
import {
  RatingFormData,
  ReviewFormData,
  AvailabilityFormData,
  InsuranceFormData,
  INSURANCE_TYPES,
  APPOINTMENT_TYPES,
  CONTACT_METHODS,
  WAIT_TIME_OPTIONS,
  CONFIDENCE_LEVELS
} from '../types/community';
import communityService from '../services/community';

interface ContributionModalProps {
  provider: Provider;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTab?: 'rating' | 'review' | 'availability' | 'insurance';
}

const ContributionModal: React.FC<ContributionModalProps> = ({
  provider,
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'rating'
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Form states
  const [ratingForm, setRatingForm] = useState<RatingFormData>({
    rating: 5,
    wait_time_rating: 3,
    communication_rating: 3,
    facility_rating: 3
  });

  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    review_text: '',
    visit_date: '',
    appointment_type: '',
    would_recommend: true,
    is_anonymous: false
  });

  const [availabilityForm, setAvailabilityForm] = useState<AvailabilityFormData>({
    accepting_new_patients: undefined,
    next_available_appointment: '',
    appointment_types: [],
    wait_time_estimate: '',
    notes: '',
    last_contacted_date: '',
    contact_method: '',
    confidence_level: 3,
    verified_by_office: false
  });

  const [insuranceForm, setInsuranceForm] = useState<InsuranceFormData>({
    insurance_name: '',
    insurance_type: '',
    plan_specific_details: '',
    copay_amount: undefined,
    deductible_applies: undefined,
    is_in_network: undefined,
    verification_date: '',
    notes: '',
    confidence_level: 3
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      switch (activeTab) {
        case 'rating':
          await communityService.ratings.createRating(user.id, provider.number, ratingForm);
          setSubmitSuccess('Rating submitted successfully!');
          break;
        
        case 'review':
          if (!reviewForm.review_text.trim()) {
            throw new Error('Please write a review');
          }
          await communityService.reviews.createReview(user.id, provider.number, reviewForm);
          setSubmitSuccess('Review submitted successfully!');
          break;
        
        case 'availability':
          await communityService.availability.createAvailabilityUpdate(user.id, provider.number, availabilityForm);
          setSubmitSuccess('Availability information submitted successfully!');
          break;
        
        case 'insurance':
          if (!insuranceForm.insurance_name.trim()) {
            throw new Error('Please enter an insurance name');
          }
          await communityService.insurance.createInsuranceInfo(user.id, provider.number, insuranceForm);
          setSubmitSuccess('Insurance information submitted successfully!');
          break;
      }

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);

    } catch (error: any) {
      setSubmitError(error.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (value: number, onChange: (value: number) => void, label: string) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              size={24}
              className={`${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              } transition-colors`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({value}/5)</span>
      </div>
    </div>
  );

  const renderRatingForm = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rate Your Experience</h3>
        <p className="text-sm text-gray-600 mb-6">
          Help others by sharing your experience with this provider.
        </p>
      </div>

      {renderStarRating(
        ratingForm.rating,
        (value) => setRatingForm(prev => ({ ...prev, rating: value })),
        'Overall Experience *'
      )}

      {renderStarRating(
        ratingForm.wait_time_rating || 3,
        (value) => setRatingForm(prev => ({ ...prev, wait_time_rating: value })),
        'Wait Time'
      )}

      {renderStarRating(
        ratingForm.communication_rating || 3,
        (value) => setRatingForm(prev => ({ ...prev, communication_rating: value })),
        'Communication'
      )}

      {renderStarRating(
        ratingForm.facility_rating || 3,
        (value) => setRatingForm(prev => ({ ...prev, facility_rating: value })),
        'Facility Quality'
      )}
    </div>
  );

  const renderReviewForm = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>
        <p className="text-sm text-gray-600 mb-6">
          Share details about your experience to help others make informed decisions.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review *
        </label>
        <textarea
          value={reviewForm.review_text}
          onChange={(e) => setReviewForm(prev => ({ ...prev, review_text: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Describe your experience with this provider..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visit Date
          </label>
          <input
            type="date"
            value={reviewForm.visit_date}
            onChange={(e) => setReviewForm(prev => ({ ...prev, visit_date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Type
          </label>
          <select
            value={reviewForm.appointment_type}
            onChange={(e) => setReviewForm(prev => ({ ...prev, appointment_type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select type</option>
            {APPOINTMENT_TYPES.map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Would you recommend this provider?
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={reviewForm.would_recommend === true}
              onChange={() => setReviewForm(prev => ({ ...prev, would_recommend: true }))}
              className="mr-2"
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={reviewForm.would_recommend === false}
              onChange={() => setReviewForm(prev => ({ ...prev, would_recommend: false }))}
              className="mr-2"
            />
            No
          </label>
        </div>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={reviewForm.is_anonymous}
            onChange={(e) => setReviewForm(prev => ({ ...prev, is_anonymous: e.target.checked }))}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Post anonymously</span>
        </label>
      </div>
    </div>
  );

  const renderAvailabilityForm = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Share Availability Information</h3>
        <p className="text-sm text-gray-600 mb-6">
          Help others know when this provider is accepting new patients.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Accepting New Patients?
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={availabilityForm.accepting_new_patients === true}
              onChange={() => setAvailabilityForm(prev => ({ ...prev, accepting_new_patients: true }))}
              className="mr-2"
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={availabilityForm.accepting_new_patients === false}
              onChange={() => setAvailabilityForm(prev => ({ ...prev, accepting_new_patients: false }))}
              className="mr-2"
            />
            No
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={availabilityForm.accepting_new_patients === undefined}
              onChange={() => setAvailabilityForm(prev => ({ ...prev, accepting_new_patients: undefined }))}
              className="mr-2"
            />
            Unknown
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Next Available Appointment
          </label>
          <input
            type="date"
            value={availabilityForm.next_available_appointment}
            onChange={(e) => setAvailabilityForm(prev => ({ ...prev, next_available_appointment: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wait Time Estimate
          </label>
          <select
            value={availabilityForm.wait_time_estimate}
            onChange={(e) => setAvailabilityForm(prev => ({ ...prev, wait_time_estimate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select wait time</option>
            {WAIT_TIME_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Contacted Date
          </label>
          <input
            type="date"
            value={availabilityForm.last_contacted_date}
            onChange={(e) => setAvailabilityForm(prev => ({ ...prev, last_contacted_date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Method
          </label>
          <select
            value={availabilityForm.contact_method}
            onChange={(e) => setAvailabilityForm(prev => ({ ...prev, contact_method: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select method</option>
            {CONTACT_METHODS.map(method => (
              <option key={method} value={method}>
                {method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How confident are you in this information?
        </label>
        <select
          value={availabilityForm.confidence_level}
          onChange={(e) => setAvailabilityForm(prev => ({ ...prev, confidence_level: parseInt(e.target.value) }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {CONFIDENCE_LEVELS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={availabilityForm.notes}
          onChange={(e) => setAvailabilityForm(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Any additional details about availability..."
        />
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={availabilityForm.verified_by_office}
            onChange={(e) => setAvailabilityForm(prev => ({ ...prev, verified_by_office: e.target.checked }))}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">This information was verified directly by the office</span>
        </label>
      </div>
    </div>
  );

  const renderInsuranceForm = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Insurance Information</h3>
        <p className="text-sm text-gray-600 mb-6">
          Help others know what insurance this provider accepts.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Insurance Name *
          </label>
          <input
            type="text"
            value={insuranceForm.insurance_name}
            onChange={(e) => setInsuranceForm(prev => ({ ...prev, insurance_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., Blue Cross Blue Shield"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Insurance Type
          </label>
          <select
            value={insuranceForm.insurance_type}
            onChange={(e) => setInsuranceForm(prev => ({ ...prev, insurance_type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select type</option>
            {INSURANCE_TYPES.map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          In Network Status
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={insuranceForm.is_in_network === true}
              onChange={() => setInsuranceForm(prev => ({ ...prev, is_in_network: true }))}
              className="mr-2"
            />
            In Network
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={insuranceForm.is_in_network === false}
              onChange={() => setInsuranceForm(prev => ({ ...prev, is_in_network: false }))}
              className="mr-2"
            />
            Out of Network
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={insuranceForm.is_in_network === undefined}
              onChange={() => setInsuranceForm(prev => ({ ...prev, is_in_network: undefined }))}
              className="mr-2"
            />
            Unknown
          </label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Copay Amount
          </label>
          <input
            type="number"
            value={insuranceForm.copay_amount || ''}
            onChange={(e) => setInsuranceForm(prev => ({ ...prev, copay_amount: e.target.value ? parseFloat(e.target.value) : undefined }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="25.00"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Date
          </label>
          <input
            type="date"
            value={insuranceForm.verification_date}
            onChange={(e) => setInsuranceForm(prev => ({ ...prev, verification_date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confidence Level
          </label>
          <select
            value={insuranceForm.confidence_level}
            onChange={(e) => setInsuranceForm(prev => ({ ...prev, confidence_level: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {CONFIDENCE_LEVELS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plan Specific Details
        </label>
        <input
          type="text"
          value={insuranceForm.plan_specific_details}
          onChange={(e) => setInsuranceForm(prev => ({ ...prev, plan_specific_details: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g., PPO Gold Plan, Group #12345"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={insuranceForm.notes}
          onChange={(e) => setInsuranceForm(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Any additional details about insurance coverage..."
        />
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={insuranceForm.deductible_applies}
            onChange={(e) => setInsuranceForm(prev => ({ ...prev, deductible_applies: e.target.checked }))}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Deductible applies</span>
        </label>
      </div>
    </div>
  );

  const getProviderName = () => {
    if (provider.enumeration_type === 'NPI-2') {
      return provider.basic.organization_name;
    }
    return `${provider.basic.first_name} ${provider.basic.last_name}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Contribute Information
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Help others learn about {getProviderName()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'rating', label: 'Rating', icon: Star },
              { key: 'review', label: 'Review', icon: MessageSquare },
              { key: 'availability', label: 'Availability', icon: Calendar },
              { key: 'insurance', label: 'Insurance', icon: Shield }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-4 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} className="mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'rating' && renderRatingForm()}
          {activeTab === 'review' && renderReviewForm()}
          {activeTab === 'availability' && renderAvailabilityForm()}
          {activeTab === 'insurance' && renderInsuranceForm()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertTriangle size={16} className="text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
              <CheckCircle size={16} className="text-green-500 mr-2" />
              <span className="text-green-700 text-sm">{submitSuccess}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              By contributing, you agree to share this information with the community.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionModal;