'use client'

import React from 'react';
import { 
  ArrowRight, Phone, Clock, AlertCircle, Mail, 
  FileText, Building2, HeartPulse, Timer
} from 'lucide-react';
import { Link } from '../components/ui/Link';

const About: React.FC = () => {
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
              We're transforming healthcare access with real-time availability data and 
              AI-powered matching.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6">
                We started Whoosh MD with one stubborn question: "Why does finding a doctor 
                still feel like dialing a broken phone tree?" Nearly half of the locations 
                listed in U.S. provider directories are wrong, and up to 36% of doctors 
                falsely appear as "accepting new patients."
              </p>
              
              <div className="mt-8 bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">The Problem is Real:</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-gray-700">Nearly 50% of provider directory listings are incorrect</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-gray-700">Up to 36% of doctors falsely appear as "accepting new patients"</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-gray-700">In Boston alone, waiting for a first primary-care visit can stretch 40–136 days</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">Sources: Curatus.com, Health Affairs, Boston.com</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/7089629/pexels-photo-7089629.jpeg" 
                alt="Healthcare professional using technology" 
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Cut the wait, kill the guess-work, and get every patient matched to real, 
              available care—fast.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 p-3 rounded-xl">
                  <HeartPulse className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    Healthcare APIs
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    We integrate with multiple healthcare data sources to ensure accuracy.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 p-3 rounded-xl">
                  <Phone className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    AI Voice/Text Outreach
                  </h3>
                  <p className="text-gray-600">
                    Automated communication systems verify availability in real-time.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 p-3 rounded-xl">
                  <Timer className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Live Feedback Loops
                  </h3>
                  <p className="text-gray-600">
                    Continuous updates keep provider data as fresh as a rideshare ETA.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 p-3 rounded-xl">
                  <Building2 className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Clinic Integration
                  </h3>
                  <p className="text-gray-600">
                    Seamless connection with existing healthcare systems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Ready to pilot in your region, list your clinic, or invest in friction-free care access?
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6 text-left">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-primary-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Email Us</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4">Get in touch with our founding team</p>
              <a 
                href="mailto:founders@whooshmd.com"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                founders@whooshmd.com
              </a>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 text-left">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-primary-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Press Kit</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4">Media resources and company information</p>
              <a 
                href="/press"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                whooshmd.com/press
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;