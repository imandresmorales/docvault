# 📁 DocVault — Document Repository

A full-stack document management system with preview, download, AI-powered summaries, and more.

## Tech Stack

| Layer       | Technology                        |
| ----------- | --------------------------------- |
| Frontend    | Next.js 15 (App Router) + TypeScript |
| Backend     | NestJS + TypeScript               |
| Database    | PostgreSQL + Prisma ORM           |
| Storage     | Local filesystem (dev) / S3 (prod)|
| Auth        | JWT + bcrypt                      |
| AI          | OpenAI API                        |

## Project Structure

```
docvault/
├── frontend/    # Next.js application
├── backend/     # NestJS API server
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL 15+ (or Docker)
- npm >= 9

### Installation

```bash
# Install all dependencies
npm install

# Start both frontend and backend in development
npm run dev
```

### Environment Variables

Copy the example env files and fill in your values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

> ⚠️ **Security**: Never commit `.env` files. They are excluded in `.gitignore`.

## License

MIT
