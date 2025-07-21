'use client'

import React from 'react';
import { FileText, AlertCircle, Scale, Mail } from 'lucide-react';

const Terms: React.FC = () => {
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

            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Agreement to Terms</h2>
                </div>
                <p className="text-gray-600">
                  By accessing or using Whoosh MD, you agree to be bound by these Terms of Service 
                  and all applicable laws and regulations. If you do not agree with any of these 
                  terms, you are prohibited from using or accessing this site.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Use License</h2>
                </div>
                <div className="space-y-4 text-gray-600">
                  <p>Permission is granted to temporarily access Whoosh MD for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose</li>
                    <li>Attempt to decompile or reverse engineer any software</li>
                    <li>Remove any copyright or other proprietary notations</li>
                    <li>Transfer the materials to another person</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Contact Information</h2>
                </div>
                <p className="text-gray-600">
                  Questions about the Terms of Service should be sent to us at terms@whooshmd.com
                </p>
              </section>
            </div>

            <div className="mt-12 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                By using Whoosh MD, you acknowledge that you have read and understand these terms 
                and agree to be bound by them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terms;