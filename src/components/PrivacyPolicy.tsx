import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ theme = 'light', onBack }) => {
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
        
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className={`prose max-w-none space-y-6 ${
          theme === 'dark' ? 'prose-invert prose-zinc text-zinc-400' : 'prose-zinc text-zinc-600'
        }`}>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <p>
            At CvToAI, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>

          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>1. Information We Collect</h2>
          <p>
            We may collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>Personal Data:</strong> Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you register with the website or when you choose to participate in various activities related to the website.</li>
            <li><strong className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>CV Data:</strong> Information contained in the resumes/CVs you upload, including work history, education, and skills.</li>
            <li><strong className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>Usage Data:</strong> Information about how you use our website, such as your IP address, browser type, and operating system.</li>
          </ul>

          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>2. How We Use Your Information</h2>
          <p>
            We use the information we collect or receive:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>To facilitate account creation and logon process.</li>
            <li>To provide and manage our services, including CV analysis and optimization.</li>
            <li>To send you administrative information, such as updates to our terms and policies.</li>
            <li>To respond to user inquiries/offer support to users.</li>
            <li>To improve our website and services.</li>
          </ul>

          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>3. Disclosure of Your Information</h2>
          <p>
            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
            <li><strong className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
          </ul>

          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>4. Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>5. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at: support@cvtoai.com
          </p>
        </div>
      </div>
    </div>
  );
};
