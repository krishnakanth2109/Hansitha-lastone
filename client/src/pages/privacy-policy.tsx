import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-6">Last updated: July 22, 2025</p>

      <p className="mb-4">
        This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
      </p>
      <p className="mb-4">
        We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy. This Privacy Policy has been created with the help of the{' '}
        <a href="https://www.termsfeed.com/privacy-policy-generator/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          Privacy Policy Generator
        </a>.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-2">Interpretation and Definitions</h2>
      <h3 className="text-xl font-semibold mt-6 mb-2">Interpretation</h3>
      <p className="mb-4">
        The words of which the initial letter is capitalized have meanings defined under the following conditions...
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-2">Definitions</h3>
      <ul className="list-disc list-inside space-y-2 mb-6">
        <li><strong>Account:</strong> A unique account created for You...</li>
        <li><strong>Affiliate:</strong> An entity that controls...</li>
        <li><strong>Company:</strong> Refers to Hansitha Creations.</li>
        <li><strong>Cookies:</strong> Small files placed on Your device...</li>
        <li><strong>Country:</strong> Telangana, India</li>
        <li><strong>Device:</strong> Any device that can access the Service...</li>
        <li><strong>Personal Data:</strong> Any information related to an individual.</li>
        <li><strong>Service:</strong> Refers to the Website.</li>
        <li><strong>Service Provider:</strong> Third-party companies or individuals...</li>
        <li><strong>Usage Data:</strong> Data collected automatically during Service use.</li>
        <li><strong>Website:</strong> Hansitha Creations, accessible at{' '}
          <a href="https://hansithacreations.com" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
            hansithacreations.com
          </a>
        </li>
        <li><strong>You:</strong> The individual using the Service.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Collecting and Using Your Personal Data</h2>

      <h3 className="text-xl font-semibold mb-2">Types of Data Collected</h3>
      <h4 className="text-lg font-medium mb-1">Personal Data</h4>
      <p className="mb-2">We may ask for the following information:</p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>Email address</li>
        <li>First name and last name</li>
        <li>Phone number</li>
        <li>Address, State, Province, ZIP/Postal code, City</li>
        <li>Usage Data</li>
      </ul>

      <h4 className="text-lg font-medium mb-1">Usage Data</h4>
      <p className="mb-4">
        Usage Data is collected automatically and includes IP address, browser type, visited pages, device info, etc.
      </p>

      <h4 className="text-lg font-medium mb-1">Tracking Technologies and Cookies</h4>
      <p className="mb-2">
        We use cookies and similar tracking technologies like web beacons to monitor user activity.
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li><strong>Session Cookies</strong> for essential functionality</li>
        <li><strong>Persistent Cookies</strong> for preferences and cookie consent</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-2">Use of Your Personal Data</h3>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>To provide and maintain our Service</li>
        <li>To manage Your Account</li>
        <li>For contract performance and communication</li>
        <li>To send updates, offers, and support</li>
        <li>For business operations, legal, security, and analysis</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-2">Retention and Deletion</h3>
      <p className="mb-4">
        We retain your personal data only as long as needed. You can request deletion by contacting us or using your account settings.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-2">Disclosure and Legal Use</h3>
      <ul className="list-disc list-inside mb-6 space-y-1">
        <li>For business transfers</li>
        <li>To comply with law</li>
        <li>To prevent fraud or threats</li>
        <li>With your consent</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Children’s Privacy</h2>
      <p className="mb-4">We do not knowingly collect data from children under 13.</p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Links to Other Websites</h2>
      <p className="mb-4">
        We are not responsible for the privacy practices of other websites.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Changes to this Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy. We’ll notify you by email or prominent notice.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Contact Us</h2>
      <p className="mb-2">If you have any questions, contact us:</p>
      <ul className="list-disc list-inside space-y-1">
        <li>Email: <a href="mailto:hansithacreations46@gmail.com" className="text-blue-600 underline">hansithacreations46@gmail.com</a></li>
        <li>Contact Form: <a href="https://hansithacreations.netlify.app/contact" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://hansithacreations.netlify.app/contact</a></li>
      </ul>
    </div>
  );
};

export default PrivacyPolicy;
