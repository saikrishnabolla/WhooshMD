'use client'

import React from 'react';
import { 
  Phone, Clock, AlertCircle, Mail, 
  Building2, HeartPulse, Timer
} from 'lucide-react';

export default function About() {
  return (
    <div className="flex flex-col">
      <section className="relative py-20 bg-gradient-to-br from-primary-600 to-primary-900">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Skip the phone-tag.<br />See a doctor this week.
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8">
              We&apos;re transforming healthcare access with real-time availability data and 
              AI-powered matching.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                The Problem We&apos;re Solving
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      45-Minute Average Wait Times
                    </h3>
                    <p className="text-gray-600">
                      Patients spend nearly an hour on hold just to schedule a basic appointment.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      6-Week Wait for Specialists
                    </h3>
                    <p className="text-gray-600">
                      Average wait time for specialist appointments keeps growing longer.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Outdated Provider Directories
                    </h3>
                    <p className="text-gray-600">
                      Most directories contain wrong phone numbers, old addresses, and fake availability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">The Traditional Process</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <span className="text-gray-700">Google search for providers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <span className="text-gray-700">Call multiple offices</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <span className="text-gray-700">Wait on hold for 20+ minutes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <span className="text-gray-700">Get transferred 3+ times</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                    5
                  </div>
                  <span className="text-gray-700">Discover they&apos;re not accepting patients</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                    6
                  </div>
                  <span className="text-gray-700">Repeat for the next provider</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Solution: AI-Powered Healthcare Access
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We&apos;ve built an AI system that calls providers in real-time to verify availability, 
              so you don&apos;t have to.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <HeartPulse className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Real-Time Verification
              </h3>
              <p className="text-gray-600 mb-4">
                Our AI agents call providers every day to verify they&apos;re accepting new patients 
                and check actual availability.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Live phone verification</li>
                <li>• Insurance acceptance confirmation</li>
                <li>• Actual appointment availability</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Timer className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                30-Second Booking
              </h3>
              <p className="text-gray-600 mb-4">
                Skip the phone calls entirely. Our system finds available appointments 
                and books them for you instantly.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Instant availability search</li>
                <li>• Automated booking process</li>
                <li>• Confirmation within minutes</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Verified Network
              </h3>
              <p className="text-gray-600 mb-4">
                Every provider in our network is verified for licensing, location, 
                and service quality.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Licensed healthcare providers</li>
                <li>• Verified contact information</li>
                <li>• Quality ratings and reviews</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why We Started Whoosh MD
            </h2>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-8 lg:p-12">
            <blockquote className="text-lg text-gray-700 italic mb-6">
              &quot;After spending 3 hours trying to book a simple check-up for my daughter, 
              I realized healthcare scheduling was fundamentally broken. When a software 
              engineer can&apos;t navigate the system, how can we expect patients to?&quot;
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">JD</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">John Doe</p>
                <p className="text-gray-600">Founder & CEO</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Ready to Skip the Phone Tag?
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                Join thousands of patients who&apos;ve already discovered a better way 
                to access healthcare.
              </p>
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                Find Providers Now
              </button>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-6">Get Updates</h3>
              <p className="text-gray-300 mb-6">
                Stay informed about new features and healthcare access improvements.
              </p>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
                />
                <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}