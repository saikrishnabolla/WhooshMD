'use client'

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { getWindowLocation } from '../lib/utils';
import { Stethoscope, Sparkles, Shield, Zap } from 'lucide-react';

const AuthUI: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex flex-col py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]" />
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                <Stethoscope size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Whoosh MD</h1>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg px-3 py-1 rounded-full text-white/90 mt-1">
                  <Sparkles size={14} className="text-yellow-300" />
                  <span className="text-xs font-medium">AI-Powered Healthcare</span>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-white/80 text-lg">
              Sign in to access real-time healthcare availability
            </p>
          </div>

          {/* Auth Form */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#2563eb',
                      brandAccent: '#1d4ed8',
                      brandButtonText: 'white',
                      defaultButtonBackground: '#f8fafc',
                      defaultButtonBackgroundHover: '#f1f5f9',
                      defaultButtonBorder: '#e2e8f0',
                      defaultButtonText: '#334155',
                      dividerBackground: '#e2e8f0',
                      inputBackground: '#ffffff',
                      inputBorder: '#e2e8f0',
                      inputBorderHover: '#cbd5e1',
                      inputBorderFocus: '#2563eb',
                      inputText: '#1e293b',
                      inputLabelText: '#475569',
                      inputPlaceholder: '#94a3b8',
                      messageText: '#dc2626',
                      messageTextDanger: '#dc2626',
                      anchorTextColor: '#2563eb',
                      anchorTextHoverColor: '#1d4ed8',
                    },
                    space: {
                      spaceSmall: '4px',
                      spaceMedium: '8px',
                      spaceLarge: '16px',
                      labelBottomMargin: '8px',
                      anchorBottomMargin: '4px',
                      emailInputSpacing: '4px',
                      socialAuthSpacing: '4px',
                      buttonPadding: '12px 24px',
                      inputPadding: '12px 16px',
                    },
                    fontSizes: {
                      baseBodySize: '14px',
                      baseInputSize: '16px',
                      baseLabelSize: '14px',
                      baseButtonSize: '16px',
                    },
                    fonts: {
                      bodyFontFamily: `'Inter', sans-serif`,
                      buttonFontFamily: `'Inter', sans-serif`,
                      inputFontFamily: `'Inter', sans-serif`,
                      labelFontFamily: `'Inter', sans-serif`,
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '12px',
                      buttonBorderRadius: '12px',
                      inputBorderRadius: '12px',
                    },
                  },
                },
                className: {
                  container: 'auth-container-custom',
                  button: 'auth-button-custom',
                  input: 'auth-input-custom',
                  label: 'auth-label-custom',
                  anchor: 'auth-anchor-custom',
                  divider: 'auth-divider-custom',
                  message: 'auth-message-custom',
                },
              }}
              providers={[]}
              redirectTo={`${getWindowLocation().origin}/dashboard`}
            />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
              <Zap className="w-6 h-6 text-white mx-auto mb-2" />
              <p className="text-white/90 text-sm font-medium">Instant Search</p>
              <p className="text-white/70 text-xs">Find providers in seconds</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
              <Shield className="w-6 h-6 text-white mx-auto mb-2" />
              <p className="text-white/90 text-sm font-medium">Secure & Private</p>
              <p className="text-white/70 text-xs">Your data is protected</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
              <Sparkles className="w-6 h-6 text-white mx-auto mb-2" />
              <p className="text-white/90 text-sm font-medium">AI-Powered</p>
              <p className="text-white/70 text-xs">Smart availability checks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthUI;