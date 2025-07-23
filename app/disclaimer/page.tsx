'use client'

import React from 'react';
import { AlertTriangle, Heart, Stethoscope, HelpCircle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <AlertTriangle className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Medical Disclaimer</h1>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-semibold mb-2">Important Medical Disclaimer</p>
                  <p className="text-red-700">
                    The information provided by Whoosh MD is for informational purposes only and should not be considered medical advice, diagnosis, or treatment recommendations.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Not a Medical Provider</h2>
            <p className="text-gray-700 mb-6">
              Whoosh MD is a healthcare provider directory and appointment booking platform. We do not provide medical services, consultations, diagnoses, or treatments. Our role is limited to helping patients find and book appointments with licensed healthcare providers.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Always Consult Healthcare Professionals</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <Stethoscope className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-800 font-medium mb-2">Professional Medical Advice Required</p>
                  <p className="text-blue-700">
                    Always seek the advice of qualified healthcare professionals for any medical questions, conditions, or treatments. Never disregard professional medical advice or delay seeking it because of information found on our platform.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Emergency Situations</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <Heart className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-semibold mb-2">Medical Emergencies</p>
                  <p className="text-red-700">
                    In case of a medical emergency, immediately call 911 or go to the nearest emergency room. Do not use our platform for emergency medical situations.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Provider Information Accuracy</h2>
            <p className="text-gray-700 mb-6">
              While we strive to maintain accurate and up-to-date provider information, we cannot guarantee the accuracy, completeness, or timeliness of all data. Provider credentials, availability, and services may change without notice.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Questions?</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <HelpCircle className="w-5 h-5 text-primary-600" />
                <p className="font-medium text-gray-900">Need Help?</p>
              </div>
              <p className="text-gray-700">
                Contact us at <a href="mailto:support@whooshmd.com" className="text-primary-600 hover:text-primary-700">support@whooshmd.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}