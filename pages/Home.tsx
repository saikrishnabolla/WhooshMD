'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Link } from '../components/ui/Link';
import { 
  Search, ArrowRight, Shield, Heart, Clock, 
  CheckCircle, Calendar, Phone, Play, Zap, Award, MapPin, Loader2
} from 'lucide-react';

const Home: React.FC = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const specialties = [
    { value: '', label: 'Any Specialty' },
    { value: 'Family Medicine', label: 'Family Medicine' },
    { value: 'Internal Medicine', label: 'Internal Medicine' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Dermatology', label: 'Dermatology' },
    { value: 'Orthopedic Surgery', label: 'Orthopedic Surgery' },
    { value: 'Psychiatry', label: 'Psychiatry' },
  ];

  const handleQuickSearch = () => {
    if (!zipCode) {
      alert('Please enter your ZIP code');
      return;
    }
    
    setIsSearching(true);
    
    // Build search URL with parameters
    const searchParams = new URLSearchParams({
      postal_code: zipCode,
      ...(specialty && { taxonomy_description: specialty })
    });
    
    // Navigate to search page with parameters
    window.location.href = `/search?${searchParams.toString()}`;
  };

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
            
            {/* Quick Search Bar */}
            <div className="max-w-2xl mx-auto mb-8 animate-fade-in delay-300">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                    >
                      {specialties.map(spec => (
                        <option key={spec.value} value={spec.value}>
                          {spec.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Enter ZIP code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <button
                    onClick={handleQuickSearch}
                    disabled={isSearching}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {isSearching ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Search size={20} />
                        Search
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in delay-400">
              <Link 
                href="/search" 
                className="group bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-lg"
              >
                Advanced Search
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
            <div className="text-center text-gray-500 text-sm animate-fade-in delay-500">
              Trusted by <span className="font-medium text-gray-700">10,000+</span> patients across the US
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Redesigned Problem/Solution */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-4">
              Why Choose Us
            </h2>
            <h3 className="text-3xl sm:text-5xl font-light text-gray-900 leading-tight mb-6">
              Healthcare scheduling,
              <span className="block font-medium">finally done right</span>
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We've solved the most frustrating parts of finding and booking healthcare appointments
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Problem 1 */}
            <div className="text-center fade-in">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Hours of Phone Calls</h4>
              <p className="text-gray-600 mb-4">Average time to book: 45+ minutes of hold music and transfers</p>
              <div className="text-sm text-primary-600 font-medium">→ Now: 30 seconds with AI</div>
            </div>
            
            {/* Problem 2 */}
            <div className="text-center fade-in delay-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-2xl flex items-center justify-center">
                <Phone className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Outdated Information</h4>
              <p className="text-gray-600 mb-4">Provider directories with wrong details and fake availability</p>
              <div className="text-sm text-primary-600 font-medium">→ Now: Real-time verification</div>
            </div>
            
            {/* Problem 3 */}
            <div className="text-center fade-in delay-200">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Insurance Surprises</h4>
              <p className="text-gray-600 mb-4">Find out after booking that your insurance isn't accepted</p>
              <div className="text-sm text-primary-600 font-medium">→ Now: Instant coverage check</div>
            </div>
          </div>
          
          {/* Our Solution */}
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-3xl p-8 lg:p-12 fade-in delay-300">
            <div className="text-center mb-12">
              <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-4">
                Our AI does the heavy lifting
              </h3>
              <p className="text-gray-600 text-lg">
                While you relax, our system works behind the scenes
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Calls Providers</h4>
                <p className="text-gray-600 text-sm">Real humans verify availability in real-time</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Shield size={24} className="text-white" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Checks Insurance</h4>
                <p className="text-gray-600 text-sm">Confirms coverage before you book</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-500 rounded-full flex items-center justify-center">
                  <Calendar size={24} className="text-white" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Books Instantly</h4>
                <p className="text-gray-600 text-sm">Secures your appointment with one click</p>
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