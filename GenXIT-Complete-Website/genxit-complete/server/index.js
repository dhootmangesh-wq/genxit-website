import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 4000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '20kb' }));

const limitMap = new Map();
function basicRateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const entry = limitMap.get(key) || { count: 0, reset: now + 10 * 60 * 1000 };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 10 * 60 * 1000; }
  entry.count += 1; limitMap.set(key, entry);
  if (entry.count > 8) return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  next();
}
const clean = value => typeof value === 'string' ? value.trim() : '';
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'GenXIT website API' }));
app.post('/api/contact', basicRateLimit, async (req, res) => {
  const name = clean(req.body?.name);
  const email = clean(req.body?.email);
  const phone = clean(req.body?.phone);
  const interest = clean(req.body?.interest);
  const message = clean(req.body?.message);
  if (name.length < 2 || name.length > 80) return res.status(400).json({ error: 'Please enter a valid name.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (phone.length > 20 || message.length < 10 || message.length > 3000) return res.status(400).json({ error: 'Please check your phone number and message.' });
  const submission = { name, email, phone, interest, message, receivedAt: new Date().toISOString() };
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.CONTACT_TO) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      await transporter.sendMail({
        from: process.env.CONTACT_FROM || process.env.SMTP_USER,
        to: process.env.CONTACT_TO,
        replyTo: email,
        subject: `GenXIT website enquiry: ${interest}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nInterest: ${interest}\n\nMessage:\n${message}\n\nReceived: ${submission.receivedAt}`
      });
    } else {
      // Configure SMTP before production. This fallback is useful for local testing only.
      console.log('CONTACT FORM SUBMISSION (SMTP not configured):', JSON.stringify(submission));
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact email delivery failed:', error.message);
    return res.status(500).json({ error: 'We could not deliver your enquiry right now. Please email hello@genxit.co.in.' });
  }
});

if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(__dirname, '../dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}
app.listen(PORT, () => console.log(`GenXIT server listening on port ${PORT}`));