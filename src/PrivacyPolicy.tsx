import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
                    <Link 
                        to="/" 
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Return to Camera
                    </Link>
                </div>

                <section className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">1. Information We Collect</h2>
                    <p className="mb-4">
                        Our application uses your device's camera to apply Augmented Reality (AR) effects. 
                        To do this, we process video frames from your camera locally on your device.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>We do not store your face data or video feed on our servers.</li>
                        <li>All processing happens in real-time on your device.</li>
                        <li>We do not collect any personal identification information (PII).</li>
                    </ul>
                </section>

                <section className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">2. Camera Usage</h2>
                    <p className="mb-4">
                        Access to your camera is required solely for the purpose of displaying AR effects. 
                        You can revoke this permission at any time through your browser or device settings.
                    </p>
                </section>

                <section className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">3. Third-Party Services</h2>
                    <p className="mb-4">
                        We use Snap Camera Kit SDK to provide AR experiences. 
                        Please refer to <a href="https://snap.com/privacy/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Snap's Privacy Policy</a> for more information on how they handle data.
                    </p>
                </section>

                <section className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">4. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at: <br/>
                        <a href="mailto:support@example.com" className="text-blue-400 hover:underline">support@example.com</a>
                    </p>
                </section>

                <div className="text-sm text-gray-500 pt-8 border-t border-gray-800 text-center">
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
