"use client";

import React, { useEffect, useRef, useState } from "react";
import { Link } from "../components/ui/Link";
import {
  Search,
  ArrowRight,
  Shield,
  Heart,
  CheckCircle,
  Calendar,
  Zap,
  Award,
  Loader2,
} from "lucide-react";

const Home: React.FC = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [zipCode, setZipCode] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const specialties = [
    { value: "", label: "Any Specialty" },
    { value: "Family Medicine", label: "Family Medicine" },
    { value: "Internal Medicine", label: "Internal Medicine" },
    { value: "Pediatrics", label: "Pediatrics" },
    { value: "Cardiology", label: "Cardiology" },
    { value: "Dermatology", label: "Dermatology" },
    { value: "Orthopedic Surgery", label: "Orthopedic Surgery" },
    { value: "Psychiatry", label: "Psychiatry" },
  ];

  const handleQuickSearch = () => {
    if (!zipCode) {
      alert("Please enter your ZIP code");
      return;
    }

    setIsSearching(true);

    // Build search URL with parameters
    const searchParams = new URLSearchParams({
      postal_code: zipCode,
      ...(specialty && { taxonomy_description: specialty }),
    });

    // Navigate to search page with parameters
    window.location.href = `/search?${searchParams.toString()}`;
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll(".fade-in").forEach((element) => {
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
              <span className="text-sm font-medium">
                HIPAA Compliant • Verified Providers
              </span>
            </div>

            {/* Main headline - Apple-style typography */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light text-gray-900 mb-6 leading-tight tracking-tight animate-fade-scale">
              Find a provider who takes your insurance in minutes.
              <span className="block font-medium text-primary-600">
                For real, this time.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-200 font-light">
              Let our AI voice agent handle the hassle of booking. From
              insurance verification to live availability, we’ve got you
              covered.
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
                      {specialties.map((spec) => (
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
                        Search Providers
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
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>

              {/* <button className="group flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors font-medium">
                <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                  <Play size={16} className="ml-0.5" />
                </div>
                Watch how it works
              </button> */}
            </div>

            {/* Social proof - minimal */}
            {/* <div className="text-center text-gray-500 text-sm animate-fade-in delay-500">
              Trusted by{" "}
              <span className="font-medium text-gray-700">10,000+</span>{" "}
              patients across the US
            </div> */}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl sm:text-5xl font-light text-gray-900 leading-tight mb-6">
              Why Choose{" "}
              <span className="text-primary-600 font-medium">Whoosh MD</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The fastest way from &apos;I need a doctor&apos; to &apos;I have
              one&apos;.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/*  Live Appointment Availability */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 fade-in">
              <div className="w-16 h-16 mb-6 bg-green-100 rounded-2xl flex items-center justify-center">
                <Search className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Live Appointment Availability
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI voice agent calls up to 6 provider offices at once,
                returning real-time open slots. So you can book the appointment
                that fits your schedule.
              </p>
            </div>

            {/* Real-Time Insurance Verification */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 fade-in delay-100">
              <div className="w-16 h-16 mb-6 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Insurance confirmed
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI checks that your chosen provider takes your plan before
                you book, sparing you surprise bills later.
              </p>
            </div>

            {/* Reviews you can trust */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 fade-in delay-200">
              <div className="w-16 h-16 mb-6 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Reviews you can trust
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Only patients who have actually seen the doctor can leave
                feedback. No fake profiles, no paid advertising. We only win if
                you win.
              </p>
            </div>

            {/* Built for everyone */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 fade-in delay-300">
              <div className="w-16 h-16 mb-6 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Built for everyone
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Multilingual symptom intake and a simple interface make it easy
                for non-English speakers and first-time patients to get care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Apple-style process */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl sm:text-5xl font-light text-gray-900 leading-tight">
              How It <span className="text-primary-600 font-medium">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mt-6">
              Three simple steps to find the care you need, right when you need
              it.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center fade-in">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary-50 rounded-2xl flex items-center justify-center relative">
                <Search className="w-8 h-8 text-primary-600" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
              </div>
              <h4 className="text-xl font-medium text-gray-900 mb-3">
                Input Your Needs
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Enter your ZIP code, insurance details, preferred time window,
                and favorite up to 6 providers.
              </p>
            </div>

            <div className="text-center fade-in delay-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary-50 rounded-2xl flex items-center justify-center relative">
                <CheckCircle className="w-8 h-8 text-primary-600" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
              </div>
              <h4 className="text-xl font-medium text-gray-900 mb-3">
                AI Verification
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Our AI agent contacts all the 6 providers simultaneously to
                confirm available slots.
              </p>
            </div>

            <div className="text-center fade-in delay-200">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary-50 rounded-2xl flex items-center justify-center relative">
                <Calendar className="w-8 h-8 text-primary-600" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
              </div>
              <h4 className="text-xl font-medium text-gray-900 mb-3">
                Book Instantly
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Choose from verified openings and secure your appointment right
                away.
              </p>
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
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                HIPAA Compliant
              </h4>
              <p className="text-gray-600">
                Your health information is protected with enterprise-grade
                security.
              </p>
            </div>

            <div className="text-center fade-in delay-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Award size={32} className="text-blue-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Verified Providers
              </h4>
              <p className="text-gray-600">
                All healthcare providers are licensed and verified through
                official databases.
              </p>
            </div>

            <div className="text-center fade-in delay-200">
              <div className="w-16 h-16 mx-auto mb-6 bg-purple-50 rounded-2xl flex items-center justify-center">
                <Heart size={32} className="text-purple-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Patient-First
              </h4>
              <p className="text-gray-600">
                Designed by patients, for patients. Your care experience comes
                first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Minimal presentation */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          <div className="grid md:grid-cols-3 gap-12 text-center fade-in">
            <div>
              <div className="text-5xl font-light text-gray-900 mb-2">
                2 min
              </div>
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

      {/* Final CTA - Purple theme */}
      <section className="py-32 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />

        <div className="container mx-auto px-6 lg:px-8 max-w-4xl relative">
          <div className="text-center fade-in">
            <h2 className="text-4xl sm:text-5xl font-light text-white mb-6 leading-tight">
              Ready to experience
              <span className="block font-medium">
                healthcare scheduling reimagined?
              </span>
            </h2>
            <p className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto">
              Join thousands who&apos;ve already discovered a better way to
              access healthcare.
            </p>
            <Link
              href="/search"
              className="group inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 text-lg"
            >
              Start Your Search
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;