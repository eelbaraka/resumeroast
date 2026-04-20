# ResumeRoast 🔥

Brutally honest AI resume feedback in 30 seconds.

## Deploy to Vercel in 5 minutes

### 1. Upload to GitHub
- Create a new repo on github.com
- Upload all these files

### 2. Connect to Vercel
- Go to vercel.com → New Project
- Import your GitHub repo
- Click Deploy

### 3. Add your API key
- In Vercel: Project → Settings → Environment Variables
- Add: `ANTHROPIC_API_KEY` = your key from console.anthropic.com

### 4. Redeploy
- Vercel → Deployments → Redeploy

## Local development

```bash
npm install
cp .env.local.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000
