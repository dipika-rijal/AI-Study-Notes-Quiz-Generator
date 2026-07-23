#!/bin/bash
# Local build and deploy script for the frontend
# Requires Netlify CLI: npm install -g netlify-cli

echo "Building frontend..."
cd ../frontend || exit
npm run build

echo "Deploying to Netlify..."
netlify deploy --prod --dir=dist

echo "Deployment complete!"
