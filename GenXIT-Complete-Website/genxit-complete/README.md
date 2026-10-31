# GenXIT Website

Responsive React + Vite frontend with an Express contact API.

## Included
- Single-page responsive corporate website with sections for IT services, application development, IT training, AI/ML, cloud/DevOps, talent enablement and company profile.
- Contact form with client/server validation and basic per-IP rate limiting.
- Optional SMTP email delivery through Nodemailer.
- SEO metadata, Open Graph tags, canonical URL, robots.txt, sitemap.xml and favicon.
- Reduced-motion support and accessible form labels/navigation controls.

## Requirements
- Node.js 20 LTS or newer recommended
- npm

## Run locally
```bash
npm install
cp .env.example .env
npm run dev
```
Frontend runs at http://localhost:5173. In another terminal:
```bash
npm run server
```
API runs at http://localhost:4000. For local development, configure Vite proxy (already in `vite.config.js`) so `/api` calls reach the API server.

## Configure email delivery
Edit `.env`:
```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
CONTACT_TO=hello@genxit.co.in
CONTACT_FROM=website@genxit.co.in
```
Use an SMTP credential/app password from your email provider; do not commit `.env`. Test the contact form end-to-end before launch. Without SMTP configured, submissions are logged to the backend console for development only; they are not stored in a database and must not be treated as production lead capture.

## Build
```bash
npm run build
```
The production frontend is generated in `dist/`.

## Low-cost deployment option: one service on Render
This is the simplest deployment because Express can serve the built React app and the API from one Node service.

1. Push this project to a private or public GitHub repository.
2. Create a **Web Service** on Render and connect the repository.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Set environment variables in Render: `NODE_ENV=production`, `PORT` (Render usually injects this), `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO`, `CONTACT_FROM`.
6. Deploy and test `https://your-service.onrender.com/api/health` and the contact form.
7. In your domain registrar, add the DNS records Render currently specifies for your custom domain `genxit.co.in` and `www.genxit.co.in`. DNS values can change; copy the exact values from the Render dashboard.
8. Set up HTTPS in Render and choose the canonical host (root or www). Redirect the alternate hostname to the canonical one.

Free hosting tiers and their limits can change. Check the provider's current pricing, sleep/cold-start behavior, bandwidth and custom-domain rules before choosing. A free instance may sleep when idle.

## Alternative: Vercel frontend + Render/Railway backend
- Deploy the Vite frontend to Vercel with build command `npm run build` and output directory `dist`.
- Deploy the Express API as a separate Node web service.
- Set `VITE_API_BASE_URL` support in the frontend if deploying separately, or update the fetch URL in `src/App.jsx` to the backend URL and configure CORS. The included `vercel.json` is a routing example only; replace `YOUR-BACKEND-HOST` with your real backend host before deploying. Do not deploy the placeholder unchanged.
- Set the backend `CLIENT_ORIGIN` to the exact Vercel production domain(s).

## Before public launch
- Confirm legal business name, registered address, phone, support email and social links.
- Replace generic contact details if needed; verify `hello@genxit.co.in` exists and is monitored.
- Add Privacy Policy, Terms, and any required cookie notice based on the actual analytics/marketing tools you install.
- Configure SMTP and test delivery, spam handling and reply-to behavior.
- Add real project case studies, trainer bios, course details, client permissions and authentic testimonials only when verified.
- Add analytics/Search Console after creating the relevant accounts; submit `/sitemap.xml`.
- Consider persistent lead storage (database/CRM), CAPTCHA or managed bot protection, structured logging and backup/monitoring before scaling.
- Have a security review before collecting sensitive or confidential customer information.

## Important production notes
This starter is a deployable foundation, not a substitute for final business/legal review. It does not claim certifications, client logos, case studies or testimonials. The contact endpoint uses an in-memory rate limiter; for multiple instances use a shared store (for example Redis) and consider a CAPTCHA provider. Contact form submissions are not persisted unless you add a database or CRM integration.
