<div align="center">
<img width="1200" height="475" alt="Google AI Studio banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: [https://ai.studio/apps/861877fb-ce39-4486-8f4d-4f2fd3db03c1](https://ai.studio/apps/861877fb-ce39-4486-8f4d-4f2fd3db03c1)

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:

   ```bash
   npm install
   ```
2. Set `GEMINI_API_KEY` in [.env](.env) to your Gemini API key. This key is only read by the local
   server (`server.ts`) and is never sent to the browser.
3. Run the API proxy and the app (in separate terminals):

   ```bash
   npm run server
   ```

   ```bash
   npm run dev
   ```
