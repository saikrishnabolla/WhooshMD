'use client'

import React, { useEffect, useRef } from 'react';
import { Link } from '../components/ui/Link';
import { 
  Search, ArrowRight, Shield, Heart, Clock, 
  CheckCircle, Calendar, Phone, Play, Zap, Award
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
    <div className="flex flex-col bg-white">
      {/* Hero Section - Apple-inspired minimal design */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
        
        {/* Floating elements - minimal and healthcare themed */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-200 rounded-full animate-pulse opacity-40" />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-green-300 rounded-full animate-pulse opacity-30 delay-1000" />
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse opacity-50 delay-2000" />
        </div>
        
        <div className="container relative mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-4xl mx-auto">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-2 rounded-full text-green-700 mb-8 animate-fade-in">
              <Shield size={14} />
              <span className="text-sm font-medium">HIPAA Compliant • Verified Providers</span>
            </div>
            
            {/* Main headline - Apple-style typography */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light text-gray-900 mb-6 leading-tight tracking-tight animate-fade-scale">
              Healthcare appointments
              <span className="block font-medium text-primary-600">
                in under 30 seconds
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-200 font-light">
              AI-powered scheduling that finds real availability, verifies insurance, 
              and books your appointment — all while you wait.
            </p>
            
            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in delay-300">
              <Link 
                href="/search" 
                className="group bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-lg"
              >
                Find Care Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="group flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors font-medium">
                <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                  <Play size={16} className="ml-0.5" />
                </div>
                Watch how it works
              </button>
            </div>
            
            {/* Social proof - minimal */}
            <div className="text-center text-gray-500 text-sm animate-fade-in delay-400">
              Trusted by <span className="font-medium text-gray-700">10,000+</span> patients across the US
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="fade-in">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                The Problem
              </h2>
              <h3 className="text-3xl sm:text-4xl font-light text-gray-900 mb-6 leading-tight">
                Healthcare scheduling is <span className="font-medium">broken</span>
              </h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">45+ minutes per appointment</p>
                    <p className="text-gray-600 text-sm">Endless phone calls and hold times</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={20} className="text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Outdated information</p>
                    <p className="text-gray-600 text-sm">Provider directories with wrong details</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Insurance confusion</p>
                    <p className="text-gray-600 text-sm">Find out coverage after booking</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="fade-in delay-200">
              <h2 className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-4">
                Our Solution
              </h2>
              <h3 className="text-3xl sm:text-4xl font-light text-gray-900 mb-6 leading-tight">
                AI that works <span className="font-medium">for you</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Real-time verification</p>
                    <p className="text-gray-600 text-sm">AI calls providers to confirm availability</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Instant insurance check</p>
                    <p className="text-gray-600 text-sm">Know your coverage before booking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">One-click booking</p>
                    <p className="text-gray-600 text-sm">Secure your appointment instantly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Apple-style process */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              How it works
            </h2>
            <h3 className="text-3xl sm:text-5xl font-light text-gray-900 leading-tight">
              Three steps to better healthcare
            </h3>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center fade-in">
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-gray-400 mb-2">01</div>
              <h4 className="text-xl font-medium text-gray-900 mb-3">Tell us what you need</h4>
              <p className="text-gray-600 leading-relaxed">Enter your location, insurance, and the type of care you're looking for.</p>
            </div>
            
            <div className="text-center fade-in delay-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-purple-50 rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-sm font-semibold text-gray-400 mb-2">02</div>
              <h4 className="text-xl font-medium text-gray-900 mb-3">AI finds real availability</h4>
              <p className="text-gray-600 leading-relaxed">Our system contacts providers in real-time to verify open appointments.</p>
            </div>
            
            <div className="text-center fade-in delay-200">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-50 rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-sm font-semibold text-gray-400 mb-2">03</div>
              <h4 className="text-xl font-medium text-gray-900 mb-3">Book instantly</h4>
              <p className="text-gray-600 leading-relaxed">Choose your preferred time and confirm your appointment with one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust indicators */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Built for trust
            </h2>
            <h3 className="text-3xl sm:text-4xl font-light text-gray-900 leading-tight">
              Healthcare-grade security and reliability
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center fade-in">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-50 rounded-2xl flex items-center justify-center">
                <Shield size={32} className="text-green-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">HIPAA Compliant</h4>
              <p className="text-gray-600">Your health information is protected with enterprise-grade security.</p>
            </div>
            
            <div className="text-center fade-in delay-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Award size={32} className="text-blue-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Verified Providers</h4>
              <p className="text-gray-600">All healthcare providers are licensed and verified through official databases.</p>
            </div>
            
            <div className="text-center fade-in delay-200">
              <div className="w-16 h-16 mx-auto mb-6 bg-purple-50 rounded-2xl flex items-center justify-center">
                <Heart size={32} className="text-purple-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Patient-First</h4>
              <p className="text-gray-600">Designed by patients, for patients. Your care experience comes first.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Minimal presentation */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          <div className="grid md:grid-cols-3 gap-12 text-center fade-in">
            <div>
              <div className="text-5xl font-light text-gray-900 mb-2">30s</div>
              <p className="text-gray-600">Average booking time</p>
            </div>
            <div>
              <div className="text-5xl font-light text-gray-900 mb-2">95%</div>
              <p className="text-gray-600">Success rate</p>
            </div>
            <div>
              <div className="text-5xl font-light text-gray-900 mb-2">50K+</div>
              <p className="text-gray-600">Verified providers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Apple-style */}
      <section className="py-32 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
        
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl relative">
          <div className="text-center fade-in">
            <h2 className="text-4xl sm:text-5xl font-light text-white mb-6 leading-tight">
              Ready to experience
              <span className="block font-medium">healthcare scheduling reimagined?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands who've already discovered a better way to access healthcare.
            </p>
            <Link 
              href="/search" 
              className="group inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            >
              Start Your Search
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;