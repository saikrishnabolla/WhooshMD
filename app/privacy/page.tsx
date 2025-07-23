'use client'

import React from 'react';
import { Shield, Lock } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
            <p className="text-gray-700 mb-6">
              We collect information you provide directly to us, such as when you create an account, search for healthcare providers, or contact us for support.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">HIPAA Compliance</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-800 font-medium mb-2">Healthcare Information Protection</p>
                  <p className="text-gray-700">
                    We are committed to protecting your healthcare information in accordance with HIPAA regulations and industry best practices for data security.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>To provide and improve our healthcare provider search and booking services</li>
              <li>To communicate with you about appointments and service updates</li>
              <li>To ensure the security and integrity of our platform</li>
              <li>To comply with legal obligations and protect rights</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Security</h2>
            <p className="text-gray-700 mb-6">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700">
                If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@whooshmd.com" className="text-primary-600 hover:text-primary-700">privacy@whooshmd.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}