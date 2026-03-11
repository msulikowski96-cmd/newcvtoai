import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
  onBack: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ theme = 'light', onBack }) => {
  return (
    <div className={`min-h-screen font-sans p-6 md:p-12 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'
    }`}>
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack}
          className={`flex items-center gap-2 mb-8 transition-colors ${
            theme === 'dark' ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <ArrowLeft size={20} />
          Back
        </button>
        
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className={`prose max-w-none space-y-6 ${
          theme === 'dark' ? 'prose-invert prose-zinc text-zinc-400' : 'prose-zinc text-zinc-600'
        }`}>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <p>
            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the CvToAI website (the "Service") operated by CvToAI ("us", "we", or "our").
          </p>

          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>1. Acceptance of Terms</h2>
          <p>
            Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service. By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
          </p>

          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>2. Accounts</h2>
          <p>
            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
          </p>

          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>3. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of CvToAI and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of CvToAI.
          </p>

          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>4. Links To Other Web Sites</h2>
          <p>
            Our Service may contain links to third-party web sites or services that are not owned or controlled by CvToAI.
          </p>
          <p>
            CvToAI has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party web sites or services. You further acknowledge and agree that CvToAI shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.
          </p>

          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>5. Termination</h2>
          <p>
            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
          <p>
            All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
          </p>

          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>6. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of Poland, without regard to its conflict of law provisions.
          </p>
          <p>
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.
          </p>

          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>7. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
          <p>
            By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
          </p>

          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>8. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at: support@cvtoai.com
          </p>
        </div>
      </div>
    </div>
  );
};
