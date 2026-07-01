# FlowWallet

A personal finance wallet — track income & expenses, budgets, savings goals, and multiple accounts, with analytics and monthly reports. Single-page app, no backend; all data is stored locally in the browser.

**Live:** https://flowwallet-app.netlify.app

## Features
- Dashboard with balance, cash-flow chart, budget rings, and account balances
- Transactions with search, date filters, and CSV export
- Budgets with monthly picker and circular progress
- Analytics (spending by category, trend, insights)
- Savings goals with contributions
- Multiple accounts + transfers
- Recurring transactions
- Monthly Reports (print / save as PDF)
- Local login + profile
- Currency selector (INR, USD, MVR, EUR, GBP, AED)
- Installable PWA with offline support

## Tech
Plain HTML + Tailwind (CDN) + Chart.js (CDN). Everything lives in `index.html`; `manifest.json`, `sw.js`, and `icon.svg` power the PWA.

## Develop
Open `index.html` in a browser. For PWA/offline testing, serve over http (e.g. VS Code Live Server).

## Deploy
Pushes to `main` auto-deploy to Netlify.
