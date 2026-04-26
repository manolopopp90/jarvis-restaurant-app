# Restaurant Ordering App Frontend

React + Vite + Tailwind CSS Frontend für **Restaurant dä Seeblick** - Berg SG.

## Features

- ✅ QR-Code Scanner für Tisch-Identifikation
- ✅ Digitale Speisekarte mit Kategorien (Vorspeisen, Hauptgerichte, Desserts, Getränke, Znüni & Zmittag)
- ✅ Interaktiver Warenkorb
- ✅ Bestellabwicklung mit Bestätigung
- ✅ Admin Dashboard für Tischmanagement
- ✅ Alle Buttons klickbar und funktional
- ✅ Responsive Design (Mobile-first)
- ✅ Deutsches UI (de-CH)

## Technologien

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- React Router v7
- Lucide React Icons

## Design-System

Basierend auf dem Design-Dokument:
- **Seeblick Green** `#8BD354` — Primär, CTAs
- **Lake Deep Blue** `#052332` — Header, Navigation
- **Warm Brown** `#94816A` — Text
- **Cream White** `#FDF2C7` — Hintergründe

## Projektstruktur

```
src/
  components/        # Wiederverwendbare Komponenten
    BottomNav.tsx
    CategoryCard.tsx
    ItemDetailModal.tsx
    MenuItemCard.tsx
    TableCard.tsx
    TopBar.tsx
  contexts/          # React Contexts (State Management)
    CartContext.tsx
    OrderContext.tsx
    TableContext.tsx
  data/              # Demo-Daten
    menuData.ts      # 20+ Menü-Items
    tableData.ts     # 12 Tische
  pages/             # Seiten/Routen
    HomePage.tsx
    MenuPage.tsx
    CartPage.tsx
    QRScannerPage.tsx
    OrderConfirmationPage.tsx
    AdminDashboardPage.tsx
    TableManagementPage.tsx
  types/             # TypeScript Typen
    index.ts
  App.tsx            # Hauptkomponente mit Routing
  main.tsx           # Entry Point
  index.css          # Tailwind + Custom Styles
```

## Installation & Start

```bash
npm install
npm run dev        # Dev Server
npm run build      # Production Build
npm run preview    # Preview Build
```

## API-Integration

Backend-API-Calls sind an `/api/` geroutet. Aktuell mit Mock-Daten; für Produktion die API-Calls in den Contexts implementieren.

---

*Erstellt am 23.04.2026 für Restaurant dä Seeblick, Berg SG*
