'use client'

import React from 'react';
import { AlertTriangle, Heart, Stethoscope, HelpCircle } from 'lucide-react';

const Disclaimer: React.FC = () => {
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

            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Stethoscope className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Not Medical Advice</h2>
                </div>
                <p className="text-gray-600">
                  Whoosh MD is a provider directory and appointment scheduling platform. The information 
                  provided on this website is for general informational purposes only. It is not 
                  intended to be and should not be interpreted as medical advice.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Provider Relationships</h2>
                </div>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Whoosh MD does not provide medical services or advice. We help connect patients 
                    with healthcare providers but:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>We do not endorse any specific healthcare providers</li>
                    <li>We are not responsible for the quality of care provided</li>
                    <li>We do not guarantee appointment availability</li>
                    <li>Provider information may change without notice</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Emergency Situations</h2>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-100 mb-4">
                  <p className="text-red-700 font-medium">
                    If you are experiencing a medical emergency, please dial 911 or visit the 
                    nearest emergency room immediately.
                  </p>
                </div>
                <p className="text-gray-600">
                  Whoosh MD is not intended for use in emergency situations. Always seek appropriate 
                  emergency medical treatment when needed.
                </p>
              </section>
            </div>

            <div className="mt-12 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                By using Whoosh MD, you acknowledge that you have read and understand this disclaimer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Disclaimer;