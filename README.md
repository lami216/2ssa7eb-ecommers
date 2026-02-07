<h1 align="center">E-Commerce Store 🛒</h1>

![Demo App](/frontend/public/screenshot-for-readme.png)

[Video Tutorial on Youtube](https://youtu.be/sX57TLIPNx8)

About This Course:
test
-   🚀 Project Setup
-   🗄️ MongoDB & Redis Integration
-   💳 Stripe Payment Setup
-   🔐 Robust Authentication System
-   🔑 JWT with Refresh/Access Tokens
-   📝 User Signup & Login
-   🛒 E-Commerce Core
-   📦 Product & Category Management
-   🛍️ Shopping Cart Functionality
-   💰 Checkout with Stripe
-   🏷️ Coupon Code System
-   👑 Admin Dashboard
-   📊 Sales Analytics
-   🎨 Design with Tailwind
-   🛒 Cart & Checkout Process
-   🔒 Security
-   🛡️ Data Protection
-   🚀Caching with Redis
-   ⌛ And a lot more...

### Setup .env file


```bash
PORT=5000
MONGO_URI=your_mongo_uri

UPSTASH_REDIS_URL=your_redis_url

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Run this app locally

```shell
npm run build
```

### Start the app

```shell
npm run start
```

## Supervisor Orchestrator (Repo 1)

### Import the workflow
1. In n8n, import `supervisor-workflow.json` from the repo root.
2. Ensure the workflow uses the `project-registry.json` file from the same directory.

### Required credentials (placeholders)
Create credentials in n8n for:
- **LLM provider (OpenAI/Codex via API)**: configure an OpenAI API credential (name used in the workflow: `OpenAI API`).
- **Telegram trigger** (if you use Telegram as the entrypoint): configure your Telegram credential and connect it to the workflow trigger you use.

### Project registry
Edit `project-registry.json` to add or update projects. For now the workflow always selects `shop3`, but the registry is ready for future shops.

### PR merge + deployment note
The workflow creates a PR and waits for manual user merge. Deployment is **not** run from this repo; it will be triggered separately by Repo 3 after the PR is merged.
