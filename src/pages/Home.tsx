'use client'

import React, { useEffect, useRef } from 'react';
import { Link } from '../components/ui/Link';
import { 
  Search, Brain, Phone, ShieldCheck, Wind, 
  ArrowRight, Sparkles, Clock, Check
} from 'lucide-react';
import { 
  Stethoscope, Calendar, Zap, 
  HeartPulse, Activity, Timer
} from 'lucide-react';

const Home: React.FC = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in').forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-900 opacity-95" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-6xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full text-white/90 mb-6 animate-fade-in">
              <Sparkles size={16} className="text-yellow-300" />
              <span className="text-sm font-medium">AI-Powered Healthcare Search</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight animate-fade-scale">
              Find Healthcare,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                Faster Than Ever
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl animate-fade-in delay-200">
              Our AI-powered platform finds real-time appointment availability from local clinics 
              in seconds, not days. Experience healthcare search reimagined.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in delay-300">
              <Link 
                href="/search" 
                className="inline-flex items-center justify-center bg-white text-primary-600 px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Search size={20} className="mr-2" />
                Start Searching
                <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/about"
                className="inline-flex items-center justify-center bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-full font-medium hover:bg-white/20 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Why Choose Whoosh MD?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              From 'I need a doctor' to 'I have one'. Quick, simple, and effective healthcare provider matching.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 fade-in">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Real-time, Verified Openings</h3>
              <p className="text-gray-600">
                See only appointment slots that truly exist—no stale directories, no phone tag.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 fade-in delay-100">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Parallel AI Outreach</h3>
              <p className="text-gray-600">
                Our assistant contacts multiple clinics at once and surfaces matches in seconds.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 fade-in delay-200">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <HeartPulse className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Access for Every Patient</h3>
              <p className="text-gray-600">
                Web, phone, or SMS options ensure Medicaid members, seniors, and low-tech users are never left out.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 fade-in delay-300">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <Activity className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Zero Lift for Clinics</h3>
              <p className="text-gray-600">
                Practices keep their current workflow—verification and matching happen entirely on our side.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Three simple steps to find the care you need, right when you need it.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="relative fade-in">
              <div className="absolute -left-2 sm:-left-4 -top-2 sm:-top-4 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold text-white">1</div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                <h3 className="text-lg sm:text-xl font-semibold mb-3">Input Your Needs</h3>
                <p className="text-gray-600">
                  Enter your ZIP code, insurance details, and preferred time window.
                </p>
              </div>
            </div>
            
            <div className="relative fade-in delay-100">
              <div className="absolute -left-4 -top-4 w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">2</div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                <h3 className="text-xl font-semibold mb-3">AI Verification</h3>
                <p className="text-gray-600">
                  Our system contacts providers in real-time to confirm available slots.
                </p>
              </div>
            </div>
            
            <div className="relative fade-in delay-200">
              <div className="absolute -left-4 -top-4 w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">3</div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                <h3 className="text-xl font-semibold mb-3">Book Instantly</h3>
                <p className="text-gray-600">
                  Choose from verified openings and secure your appointment right away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 fade-in items-start">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-primary-600 mb-3">100k+</div>
              <p className="text-gray-600 text-base sm:text-lg">Healthcare Providers</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <Timer className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-5xl font-bold text-primary-600 mb-2">&lt;30s</div>
              <p className="text-gray-600">Average Search Time</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-5xl font-bold text-primary-600 mb-2">95%</div>
              <p className="text-gray-600">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-900 to-primary-800 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/3846035/pexels-photo-3846035.jpeg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative">
          <div className="max-w-3xl mx-auto text-center fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Healthcare Search?
            </h2>
            <p className="text-lg sm:text-xl text-white/80 mb-8">
              Join thousands of users who have already discovered a better way to 
              find healthcare providers.
            </p>
            <Link 
              href="/search" 
              className="inline-flex items-center justify-center bg-white text-primary-600 px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Get Started Now
              <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;