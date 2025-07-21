'use client'

import React from 'react';
import { Shield, Lock, Eye, FileCheck } from 'lucide-react';

const Privacy: React.FC = () => {
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

            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Information We Collect</h2>
                </div>
                <p className="text-gray-600">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                  <li>Account information (email, name)</li>
                  <li>Search history and preferences</li>
                  <li>Provider favorites and interactions</li>
                  <li>Usage data and analytics</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-800">How We Use Your Information</h2>
                </div>
                <p className="text-gray-600">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                  <li>Provide and improve our services</li>
                  <li>Personalize your experience</li>
                  <li>Send important notifications</li>
                  <li>Analyze usage patterns</li>
                  <li>Maintain security</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FileCheck className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Data Protection</h2>
                </div>
                <p className="text-gray-600">
                  We implement appropriate technical and organizational measures to protect your 
                  personal information. This includes:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments</li>
                  <li>Access controls and authentication</li>
                  <li>Regular backups and monitoring</li>
                </ul>
              </section>
            </div>

            <div className="mt-12 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                For questions about our privacy policy, please contact us at privacy@whooshmd.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Privacy;