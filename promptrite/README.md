This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Vercel AI Gateway Configuration

This project uses [Vercel AI SDK](https://ai-sdk.dev/getting-started) with Vercel AI Gateway for conversation scoring.

### Environment Variables

Set the following environment variables in your `.env.local` file:

- `AI_API_KEY` (required): Your Vercel AI Gateway API key
- `FIREWORKS_MODEL` (optional): The model to use for scoring. Defaults to `llama-v3-70b-instruct`

Example:
```
AI_API_KEY=your_api_gateway_key_here
FIREWORKS_MODEL=llama-v3-70b-instruct
```

### Scoring Service

The scoring service evaluates conversation quality on four dimensions:
1. **Message Count** - Evaluates if the number of messages is appropriate
2. **Clarity** - Scores the clarity of the human's messages
3. **Character Length** - Assesses message verbosity and detail level
4. **Output Quality** - Evaluates overall conversation quality and human steering

The service returns token usage metrics and structured scoring results via the tRPC endpoint `scoring.scoreConversation`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out the [Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://vercel.com/docs/deployments/overview) for more details.
