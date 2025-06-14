'use client';

import React, { useState } from 'react';
import { Mail, MessageSquare, Github, Linkedin, Disc, Send, X } from 'lucide-react';
import TelegramIcon from '@/components/icons/TelegramIcon';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type AboutPageProps = object;

const AboutPage: React.FC<AboutPageProps> = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formMessage, setFormMessage] = useState<string>(''); // Explicitly type as string

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormMessage(''); // Clear previous messages

    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setFormMessage('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setFormMessage('Please enter a valid email address.');
        return;
    }

    const { name, email, subject, message } = formData;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const mailtoLink = `mailto:hello@etfinity.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open default email client
    window.location.href = mailtoLink;

    setFormMessage('Your email client should open shortly with a pre-filled draft.');
    setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl min-h-[calc(100vh-180px)] flex flex-col">
      {/* About Us Section */}
      <section className="bg-zinc-800 rounded-2xl shadow-2xl p-6 md:p-10 border border-zinc-700 mb-8 flex-shrink-0">
        <h2 className="text-4xl font-bold text-purple-400 mb-6 text-center drop-shadow-md">
          About Etfinity
        </h2>
        <p className="text-zinc-300 text-lg leading-relaxed mb-4 text-center">
          Etfinity is pioneering a new era of decentralized finance by bringing
          synthetic Exchange-Traded Funds (ETFs) directly to your crypto wallet.
          Our mission is to democratize access to global markets, allowing users to
          gain exposure to traditional assets like the S&P 500 without the
          intermediation of traditional brokers or banks.
        </p>
        <p className="text-zinc-300 text-lg leading-relaxed mb-4 text-center">
          Built on robust blockchain technology, Etfinity offers transparency,
          security, and true ownership of synthetic assets. We believe in empowering
          individuals with the tools to manage their financial future in a
          permissionless and censorship-resistant environment.
        </p>
        <p className="text-zinc-300 text-lg leading-relaxed text-center">
          Join us as we build the bridge between traditional finance and the
          decentralized world, making investing accessible and equitable for everyone.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
        {/* Contact Us Form */}
        <section className="bg-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-zinc-700 flex flex-col">
          <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
            <Mail size={28} className="mr-3 text-purple-400" /> Get in Touch
          </h3>
          <p className="text-zinc-300 text-sm mb-6 text-center">
            Have questions or feedback? Send us a message!
          </p>
          <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col">
            <div>
              <label htmlFor="name" className="block text-zinc-300 text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-zinc-300 text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-zinc-300 text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex-grow">
              <label htmlFor="message" className="block text-zinc-300 text-sm font-medium mb-1">Message</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y min-h-[80px] max-h-[200px]"
                required
              ></textarea>
            </div>
            {formMessage && (
              <p className={`text-sm text-center ${formMessage.includes('valid') ? 'text-red-400' : 'text-green-400'}`}>
                {formMessage}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg text-lg shadow-lg transform transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 mt-auto"
            >
              <Send size={20} className="inline-block mr-2" /> Send Message
            </button>
          </form>
          <p className="text-zinc-500 text-xs mt-4 text-center">
            Note: This form will attempt to open your local email client. For a production site, a backend service is required.
          </p>
        </section>

        {/* Social Media Links */}
        <section className="bg-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-zinc-700 flex flex-col items-center justify-center text-center">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center">
            <MessageSquare size={28} className="mr-3 text-purple-400" /> Join Our Community
          </h3>
          <p className="text-zinc-300 text-lg mb-8">Connect with us on our social channels!</p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="https://x.com/etfinity_defi" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center text-zinc-300 hover:text-purple-400 transition-colors duration-200">
              <X size={48} className="mb-2 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-lg font-semibold">X (Twitter)</span>
            </a>
            <a href="https://discord.com/invite/U3tBuH9J" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center text-zinc-300 hover:text-purple-400 transition-colors duration-200">
              <Disc size={48} className="mb-2 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-lg font-semibold">Discord</span>
            </a>
            <a href="https://t.me/etfinity" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center text-zinc-300 hover:text-purple-400 transition-colors duration-200">
              <TelegramIcon size={48} className="mb-2 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-lg font-semibold">Telegram</span>
            </a>
            <a href="https://github.com/EtfinityDefi" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center text-zinc-300 hover:text-purple-400 transition-colors duration-200">
              <Github size={48} className="mb-2 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-lg font-semibold">GitHub</span>
            </a>
            <a href="https://linkedin.com/company/etfinity" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center text-zinc-300 hover:text-purple-400 transition-colors duration-200">
              <Linkedin size={48} className="mb-2 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-lg font-semibold">LinkedIn</span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AboutPage;
