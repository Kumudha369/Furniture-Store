import React, { useState } from 'react';
import axios from '../utils/axiosConfig.js';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail, Clock, MessageSquare } from 'lucide-react';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post('/api/contact', form);
      toast.success('Message sent! We will contact you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error('Failed to send message');
    } finally { setSending(false); }
  };

  return (
    <div className="contact-page page-wrapper">
      <div className="container">
        <div className="section-header">
          <h1>Contact Us</h1>
          <p>Visit our showroom or reach out — we're happy to help you find the perfect furniture</p>
        </div>

        <div className="contact-grid">
          {/* Info */}
          <div>
            <div className="card contact-info">
              <h3>Get in Touch</h3>
              <div className="info-item"><MapPin size={20} /><div>
                <strong>Showroom Address</strong>
                <p>9/365 Elumathanoor, Edanganasalai Post<br />Sankari Taluk, Salem - 637502<br />Tamil Nadu, India</p>
              </div></div>
              <div className="info-item"><Phone size={20} /><div>
                <strong>Phone / WhatsApp</strong>
                <p>Contact: Sathish<br />GST: 33MUBPS8703H1ZA</p>
              </div></div>
              <div className="info-item"><Mail size={20} /><div>
                <strong>Email</strong>
                <p>info@jothifurniture.com</p>
              </div></div>
              <div className="info-item"><Clock size={20} /><div>
                <strong>Business Hours</strong>
                <p>Monday – Saturday: 9:00 AM – 7:00 PM<br />Sunday: 10:00 AM – 5:00 PM</p>
              </div></div>
            </div>

            <div className="card map-embed">
              <div className="map-placeholder">
                <MapPin size={32} />
                <p><strong>Jothi Industrial And Furniture</strong></p>
                <p style={{fontSize:'0.85rem',color:'var(--text-3)'}}>Ilampillai, Salem, Tamil Nadu 637502</p>
                <a
                  href="https://maps.google.com/?q=Ilampillai,Salem,Tamil+Nadu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{marginTop:'0.75rem'}}
                >Open in Google Maps</a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card contact-form-card">
            <div className="form-header">
              <MessageSquare size={24} />
              <h3>Send us a Message</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row-2">
                <div className="form-group"><label>Your Name *</label><input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required /></div>
                <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required /></div>
              </div>
              <div className="form-row-2">
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} /></div>
                <div className="form-group"><label>Subject</label><input value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))} /></div>
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} required rows={5} placeholder="Tell us about your furniture requirements, customization needs, or any queries..." />
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={sending}>
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
