'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { BrutalistButton } from '../brutalism/Button';
import { BlockReveal } from '@/components/animations/BlockReveal';

export function ContactSection() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoLink = `mailto:support@justpay.wtf?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="w-full bg-[var(--color-section-blue)] border-b-2 border-[var(--color-border-default)] py-[96px] relative z-20">
      <div className="max-w-[800px] mx-auto px-[24px]">
        <div className="flex flex-col gap-12">
          
          <div className="flex flex-col gap-4 text-left items-start">
            <h2 className="text-[16px] font-bold text-[var(--color-section-brand)] uppercase tracking-widest border-2 border-[var(--color-border-default)] px-4 py-1 bg-[var(--color-neutral-primary-soft)] inline-block w-max">Support</h2>
            <BlockReveal blockColor="var(--color-section-green)">
              <h2 className="text-[48px] md:text-[64px] font-black text-black leading-[0.95] tracking-tighter uppercase mb-4">Technical Issues?</h2>
            </BlockReveal>
            <p className="text-[20px] font-bold text-black border-b-4 border-black pb-2 inline-block w-max max-w-full">
              If you're experiencing issues with a payment, routing, or bridge transaction, send us a message and we'll help sort it out immediately.
            </p>
          </div>

          <form onSubmit={handleContact} className="w-full bg-[var(--color-neutral-primary-soft)] border-4 border-black shadow-[var(--shadow-xl)] p-8 flex flex-col gap-8 transform -rotate-1">
            <div className="flex flex-col gap-3 text-left">
              <label className="text-[16px] font-black text-black uppercase tracking-widest">Issue Subject</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Transaction stuck on bridge" 
                className="w-full bg-[var(--color-neutral-secondary-soft)] border-4 border-black px-4 py-3 text-[18px] font-bold text-black placeholder-[var(--color-fg-disabled)] focus:outline-none focus:bg-[var(--color-section-yellow)] transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-3 text-left">
              <label className="text-[16px] font-black text-black uppercase tracking-widest">Message Details</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please include any relevant transaction hashes or payment link IDs..." 
                className="w-full bg-[var(--color-neutral-secondary-soft)] border-4 border-black px-4 py-3 text-[18px] font-bold text-black placeholder-[var(--color-fg-disabled)] focus:outline-none focus:bg-[var(--color-section-yellow)] transition-colors min-h-[150px] resize-y"
                required
              />
            </div>

            <BrutalistButton variant="brand" size="xl" type="submit" className="w-full mt-4">
              <Send className="w-6 h-6" strokeWidth={3} />
              <span className="text-[20px] uppercase ml-2">Send to Support</span>
            </BrutalistButton>
            
            <p className="text-[14px] font-bold text-black flex items-center justify-center gap-2 uppercase">
              <Mail className="w-4 h-4" strokeWidth={3} /> This will open your default email client.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
