'use client'

import React from 'react';
import { FileText, AlertCircle, Mail } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing and using Whoosh MD&apos;s platform, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily download one copy of Whoosh MD for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to decompile or reverse engineer any software contained on Whoosh MD</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Medical Information Disclaimer</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-800 font-medium mb-2">Important Medical Disclaimer</p>
                  <p className="text-gray-700">
                    Whoosh MD is a healthcare provider directory and appointment booking service. We do not provide medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Contact Information</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-5 h-5 text-primary-600" />
                <p className="font-medium text-gray-900">Questions about these Terms?</p>
              </div>
              <p className="text-gray-700">
                Contact us at <a href="mailto:legal@whooshmd.com" className="text-primary-600 hover:text-primary-700">legal@whooshmd.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}