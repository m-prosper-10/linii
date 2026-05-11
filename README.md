# Linii Frontend

A modern, high-performance messaging and social platform built with Next.js, React 19, and Tailwind CSS 4.

## 🚀 Overview

Linii is a state-of-the-art web application designed for seamless real-time communication and social interaction. It features a sleek, premium UI with smooth animations, dark mode support, and a responsive design that works beautifully across all devices.

## ✨ Features

- **Real-time Messaging**: Instant message delivery and receipt using Socket.io.
- **Social Feed**: Interactive post feed with support for markdown, media galleries, and reactions.
- **Smart Components**: Rich state management with optimistic updates and real-time typing indicators.
- **Premium UI/UX**: Built with Radix UI primitives, Framer Motion animations, and Tailwind CSS 4.
- **Advanced Analytics**: Visual insights into account activity and engagement using Recharts.
- **Robust Security**: Protected routes, secure token handling, and end-to-end type safety.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Primitives**: [Radix UI](https://www.radix-ui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Real-time**: [Socket.io Client](https://socket.io/)
- **State & Forms**: [React Hook Form](https://react-hook-form.com/), Native React State
- **Content**: [React Markdown](https://github.com/remarkjs/react-markdown)
- **Data Viz**: [Recharts](https://recharts.org/)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/)

## 📦 Getting Started

### Prerequisites

- Node.js 22+
- pnpm (recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Linii/frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_BACKEND_URL=your_backend_api_url
   NEXT_PUBLIC_SOCKET_URL=your_socket_server_url
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Development Commands

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint checks
- `pnpm lint:fix`: Automatically fix linting issues
- `pnpm format`: Format code with Prettier
- `pnpm tsc --noEmit`: Run TypeScript type checking

## 🚢 CI/CD & Deployment

The project includes a robust CI/CD pipeline using **GitHub Actions**:

- **Lint & Test**: Automatically runs linting and type checking on every push.
- **Security**: Includes CodeQL analysis and dependency audits.
- **Dockerization**: Automated Docker image builds.
- **Deployment**: Pushes containerized images to the GitLab Container Registry.

### Docker Support

To build and run the Docker container locally:

```bash
docker build -t linii-frontend .
docker run -p 3000:3000 linii-frontend
```

## 📜 Coding Guidelines

Please refer to [GUIDELINES.md](./guidelines/GUIDELINES.md) for detailed coding standards, including:
- Component architecture
- State synchronization patterns
- Purity and performance rules
- Type safety requirements

## 📄 License

This project is licensed under the [MIT License](LICENSE).
