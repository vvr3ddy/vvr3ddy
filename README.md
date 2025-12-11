# My Digital Garden

Welcome to My Digital Garden, a personal space for thoughts, notes, and ideas, presented in an interactive and secure way. This project is built with Next.js and features a unique visualization for navigating posts, a secure admin panel for content management, and a delightful user experience.

---

## ✨ Features

*   **Interactive Post Graph:** Posts are visualized as an interactive force-directed graph (inspired by Connected Papers).
    *   Nodes represent individual blog posts.
    *   Connections (lines) are drawn between posts sharing common tags, with distinct colors for each tag.
    *   Hovering a node highlights it and its direct neighbors, dimming the rest for focus.
    *   Nodes are clickable to navigate to the post.
*   **Secure Admin Panel:** Robust authentication for content management.
    *   **TOTP (Time-based One-Time Password) 2FA:** Enhanced security for admin login.
    *   **JWT (JSON Web Token) Sessions:** Secure, HTTP-only cookie-based sessions.
    *   **Admin Login Page:** Dedicated login UI at `/admin/login`.
    *   **Protected Routes:** Editor, Delete, and Save actions are protected.
    *   **Admin Dashboard:** A protected placeholder for future site statistics.
*   **Content Management (Studio):**
    *   **Post Editor:** A Markdown/MDX editor available at `/write`.
    *   **Edit Existing Posts:** "Edit Post" button on individual posts for authenticated admins.
    *   **Delete Posts:** Securely delete posts via the editor.
    *   **Unsaved Changes Prompt:** Warns the user before navigating away from unsaved work.
*   **Aesthetic & UX:**
    *   **Custom Computer Modern Font:** A LaTeX-inspired serif typeface for documents.
    *   **Dark Mode:** System theme preference with a manual toggle (Sun/Moon icon).
    *   **Smooth Transitions:** Animated theme switching and graph interactions.
    *   **Responsive Images:** Custom component for embedding images with captions in MDX posts.
*   **Social & Engagement:**
    *   **Persistent Likes:** Users can "like" posts, with counts stored securely (encrypted) on the server.
    *   **Share Button:** Easily share posts via native Web Share API or clipboard copy.
*   **Privacy-Focused:** Minimal data collection, with likes data encrypted on disk.

---

## 🚀 Technologies Used

*   **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Components, Client Components, API Routes)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with [`@tailwindcss/typography`](https://tailwindcss.com/docs/typography-plugin)
*   **UI Icons:** [Lucide React](https://lucide.dev/icons/)
*   **Authentication:** [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken), [speakeasy](https://www.npmjs.com/package/speakeasy) (for TOTP), [cookie](https://www.npmjs.com/package/cookie)
*   **Markdown/MDX:** [next-mdx-remote](https://www.npmjs.com/package/next-mdx-remote), [gray-matter](https://www.npmjs.com/package/gray-matter), [remark-gfm](https://www.npmjs.com/package/remark-gfm), [remark-math](https://www.npmjs.com/package/remark-math), [rehype-katex](https://www.npmjs.com/package/rehype-katex), [remark-unwrap-images](https://www.npmjs.com/package/remark-unwrap-images)
*   **Date Formatting:** [date-fns](https://date-fns.org/)
*   **Environment Management:** [dotenv](https://www.npmjs.com/package/dotenv) (handled by Next.js itself)
*   **Encryption:** Node.js `crypto` module

---

## ⚙️ Getting Started (Local Development)

Follow these steps to set up and run the project on your local machine.

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm (v9.x or later) or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git # Replace with your repo URL
cd your-repo-name
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables (`.env.local`)

You need to create a `.env.local` file in the root of your project. This file contains sensitive information and is ignored by Git, so it won't be committed to your repository.

Create a file named `.env.local` and add the following, replacing the placeholder values:

```
# Admin Authentication
ADMIN_PASSWORD=your_strong_admin_password_here # CHANGE THIS to a strong password. Avoid '#' symbol.
JWT_SECRET=your_long_random_jwt_secret # CHANGE THIS: Generate with 'openssl rand -base64 32'
TOTP_SECRET=your_totp_base32_secret # GENERATE THIS via the setup process below

# Likes Encryption
LIKES_ENCRYPTION_KEY=your_long_random_encryption_key # CHANGE THIS: Generate with 'openssl rand -hex 32'
```

*   **`ADMIN_PASSWORD`**: Your chosen password for admin login. **Avoid using the `#` symbol in this value.**
*   **`JWT_SECRET`**: A long, random string. You can generate one in your terminal: `openssl rand -base64 32`.
*   **`LIKES_ENCRYPTION_KEY`**: A long, random hexadecimal string. You can generate one: `openssl rand -hex 32`.

### 4. TOTP (Two-Factor Authentication) Setup

This is a one-time setup to enable 2FA for your admin login.

1.  **Start your Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
2.  **Access TOTP Setup Page:** Open your browser and go to `http://localhost:3000/admin/login`.
3.  **Generate Secret:** On the login page, locate the "TOTP Setup (Development Only)" section. Click the **"Generate TOTP Secret & QR Code"** button.
4.  **Scan QR Code:** A QR code will appear. Use an authenticator app on your smartphone (e.g., Google Authenticator, Authy, Microsoft Authenticator) to scan this QR code.
5.  **Copy TOTP Secret:** Below the QR code, a base32 secret string will be displayed (e.g., `JBSWY3DPEHPK3PXP`). **Copy this entire base32 string.**
6.  **Update `.env.local`:** Open your `.env.local` file again. Replace the placeholder for `TOTP_SECRET=` with the secret you just copied.
    *   **Example:** `TOTP_SECRET=JBSWY3DPEHPK3PXP`
7.  **Restart Server:** **Completely stop your `npm run dev` server (Ctrl+C) and restart it.** This is vital for the application to load the new `TOTP_SECRET` environment variable.

### 5. Run the Development Server

Once `.env.local` is configured and your server restarted (if you just did TOTP setup), you can run your app:

```bash
npm run dev
# or
yarn dev
```

Your blog should now be accessible at `http://localhost:3000`.

---

## 🔒 Admin Panel Access

*   **Admin Login:** Navigate to `http://localhost:3000/admin/login`.
    *   Use your `ADMIN_PASSWORD` (from `.env.local`).
    *   Enter the 6-digit TOTP code from your authenticator app.
*   **Post Editor (Studio):** Access `/write` (or click "Edit Post" on a specific post).
*   **Admin Dashboard:** Access `/admin/dashboard` (currently a placeholder for metrics).

---

## 🚀 Deployment

Your application utilizes Node.js API routes, which require a server environment. It cannot be deployed as a purely static site (e.g., to GitHub Pages) without significant refactoring.

For "free forever" hosting with your current filesystem-based post and likes persistence, deploying to a **Virtual Private Server (VPS)** is the recommended approach.

### High-Level VPS Deployment Steps (e.g., Oracle Cloud Free Tier)

1.  **Provision VPS:** Create a Linux VM instance (e.g., Ubuntu LTS) on your chosen provider.
2.  **Connect via SSH:** Use your SSH key to access the VM.
3.  **Install Prerequisites:** Install Git, Node.js (with NVM), and npm on the VPS.
4.  **Clone & Configure:** Clone your project from GitHub. Create a `.env.local` file on the VPS (same as local setup).
5.  **Build & Run:** Run `npm install` and `npm run build`. Use a process manager like [PM2](https://pm2.keymetrics.io/) to keep your Next.js app running.
6.  **Reverse Proxy & HTTPS:** Install and configure [Nginx](https://www.nginx.com/) as a reverse proxy to serve your app on ports 80/443, and use [Certbot](https://certbot.eff.org/) for free HTTPS certificates.

*(For detailed VPS deployment steps, refer to specific guides for your chosen provider and Next.js deployment.)*

---

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ by GEMINI** ✨