'use client';

import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PrivacyPolicyPageProps {}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = () => {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl text-white">
      <h2 className="text-4xl font-bold text-white mb-6 text-center drop-shadow-md">Privacy Policy</h2>

      <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 text-zinc-300 space-y-4">
        <p>Your privacy is important to us. This Privacy Policy describes how Etfinity collects, uses, and discloses your information.</p>

        <h3 className="text-xl font-bold text-white mt-6 mb-2">Information We Collect</h3> 
        <p>We do not collect any personal identifying information from you while you use this demo application. This application is for demonstration purposes only and does not interact with real user data or wallets beyond the simulated connection within your browser.</p>
        <ul className="list-disc list-inside ml-4 space-y-1"> 
          <li><strong className="text-purple-300">Simulated Wallet Address:</strong> When you "connect" a wallet, a dummy address is generated and stored locally in your browser's memory for the duration of your session. This is not real and is not transmitted to any server.</li>
          <li><strong className="text-purple-300">Usage Data (Optional):</strong> We may collect anonymous, aggregated usage data (e.g., number of page views, button clicks) to understand how the demo is being interacted with. This data does not identify you personally.</li>
        </ul>

        <h3 className="text-xl font-bold text-white mt-6 mb-2">How We Use Your Information</h3> 
        <p>Any simulated or aggregated data is used solely to demonstrate the functionality of the Etfinity platform. No real user data is collected, stored, or used for any commercial purposes in this demo.</p>

        <h3 className="text-xl font-bold text-white mt-6 mb-2">Data Sharing and Disclosure</h3> 
        <p>As this is a demo application, no personal data is collected, and therefore, no data is shared with third parties.</p>

        <h3 className="text-xl font-bold text-white mt-6 mb-2">Security of Data</h3> 
        <p>While we strive to use commercially acceptable means to protect your simulated information, remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. This is a demo; sensitive information should never be entered into a demo application.</p>

        <h3 className="text-xl font-bold text-white mt-6 mb-2">Changes to This Privacy Policy</h3> 
        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

        <h3 className="text-xl font-bold text-white mt-6 mb-2">Contact Us</h3> 
        <p>If you have any questions about this Privacy Policy, please contact us.</p>
      </div>
    </main>
  );
};

export default PrivacyPolicyPage;
