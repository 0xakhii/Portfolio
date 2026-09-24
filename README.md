# Omar Jamal — Portfolio

Minimal, dark-themed portfolio site for **Omar Jamal**, a Full-Stack Software Engineer based in Marrakech, Morocco.

Built with **TanStack Start** (SPA mode), **React 19**, **Tailwind CSS v4**, and **Vite 8**.

## ✨ Features

- Single-page application with client-side routing
- Interactive particle-field background
- Fully responsive design
- SEO-optimized with Open Graph, Twitter cards, and JSON-LD structured data
- Sections: Hero · Philosophy · Arsenal · Selected Works · Experience · Contact

## 🛠 Tech Stack

| Layer     | Technologies                                        |
| --------- | --------------------------------------------------- |
| Framework | TanStack Start, TanStack Router, TanStack Query     |
| UI        | React 19, Tailwind CSS v4, Radix UI, shadcn/ui      |
| Language  | TypeScript                                          |
| Bundler   | Vite 8                                              |
| Linting   | ESLint, Prettier                                    |

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10

### Install & Run

```bash
# Clone the repository
git clone https://github.com/0xakhii/Portfolio.git
cd Portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

The dev server will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

## 🐳 Docker

### Build and Run Locally

```bash
# Build the image
docker build -t portfolio .

# Run the container
docker run -d -p 8080:80 portfolio
```

Visit `http://localhost:8080`.

### Push to Docker Hub

```bash
docker tag portfolio <your-dockerhub-username>/portfolio:latest
docker push <your-dockerhub-username>/portfolio:latest
```

## 📁 Project Structure

```
Portfolio/
├── public/               # Static assets (CV, OG image, robots.txt)
├── src/
│   ├── components/       # React components (ParticleField, shadcn/ui)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and error handling
│   ├── routes/           # TanStack Router file-based routes
│   ├── router.tsx        # Router configuration
│   ├── server.ts         # Server entry point
│   ├── start.ts          # TanStack Start configuration
│   └── styles.css        # Global styles (Tailwind)
├── Dockerfile            # Multi-stage build (Node → Nginx)
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── vercel.json           # Vercel deployment config
```

## 📄 License

© 2026 Omar Jamal. All rights reserved.
