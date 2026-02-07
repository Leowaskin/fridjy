<div align="center">
<img width="1200" height="395" alt="fridjy-logo" src="/fridjy-application/fridjy_logo.png" />
</div>

## Fridjy

An AI-powered refrigerator management app that helps you track your food inventory, discover recipes, and maintain your health goals—all with the power of Google's Gemini AI.

## Features

- **Smart Fridge Scanning** : Take a photo of your fridge and let AI automatically detect all your food items with estimated expiry dates
- **Inventory Management** : Track food items, quantities, and expiry dates with automatic notifications for items going bad soon
- **Recipe Discovery** : Get personalized recipe suggestions based on what's currently in your fridge
- **Health Tracking** : Monitor your weight, calories, and macronutrients with AI-powered insights
- **Offline-First** : All data is stored locally in your browser—no account required, complete privacy

# Test our app
View our app in AI Studio: https://ai.studio/apps/drive/1pa6OFhYeVtNdqMX8Uoo8RDJSqIJ-dVNx

## Project Structure

```
fridjy/
├── fridjy-application/
│   ├── pages/
│   │   ├── Home.tsx          # Main dashboard
│   │   ├── Scan.tsx          # Camera interface for fridge scanning
│   │   ├── Recipes.tsx       # Recipe discovery
│   │   └── Health.tsx        # Health tracking & insights
│   ├── components/
│   │   ├── Navbar.tsx        # Navigation component
│   │   └── InventoryCard.tsx # Food item display
│   ├── hooks/
│   │   ├── useInventory.ts   # Inventory state management
│   │   └── useHealth.ts      # Health data management
│   ├── services/
│   │   └── geminiService.ts  # Google Gemini API integration
│   ├── App.tsx               # Main app component
│   └── types.ts              # TypeScript type definitions
└── README.md                 # This file
└── setup.md                  # Setup instructions

```

## Architecture

### Data Storage (localStorage)

Fridjy uses **browser localStorage** for data persistence:
- **`fridjy_inventory`**: Food items with quantities and expiry dates
- **`fridjy_health_profile`**: User's health metrics (weight, height, allergies)
- **`fridjy_health_logs`**: Daily calorie and macro tracking

**Advantages:**
- ⚡ Fast and responsive
- 🔒 Privacy-first (data never leaves your device, except for API calls)
- 📱 Works offline
- ✨ No login or database required

**Note:** Data is cleared if you clear your browser cache.

### Component Architecture

```
App.tsx (Router)
├── Navbar (Navigation)
└── Pages
    ├── Home (Dashboard)
    ├── Scan (Fridge Image Analysis)
    ├── Recipes (AI-Generated Suggestions)
    └── Health (Profile & Tracking)
```

### Key Modules

**Hooks (State Management)**
- `useInventory.ts`: CRUD operations for food items, auto-sync to localStorage
- `useHealth.ts`: Health profile management, calorie calculations

**Services (AI Integration)**
- `geminiService.ts`: 
  - Image analysis for fridge scanning
  - Recipe generation based on available items
  - Health insights and recommendations

## Tech Stack

- **Frontend Framework**: React 19
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Language**: TypeScript
- **AI API**: Google Gemini
- **Icons**: Lucide React
- **Utilities**: clsx

## AI Integration

Fridjy leverages **Google's Gemini 3 Flash** model for:
1. **Image Recognition**: Analyzing fridge photos to identify food items
2. **Recipe Generation**: Creating personalized recipes from available ingredients
3. **Health Analysis**: Providing nutrition insights and health recommendations

All API calls are made client-side with your API key.

## Pages Overview

### Home
Dashboard showing:
- Inventory summary
- Items expiring soon
- Quick health stats
- Navigation to other sections

### Scan
- Camera interface to capture fridge photos
- AI automatically detects and adds items
- Review and confirm detected items
- Add custom items manually

### Recipes
- View recipe suggestions based on current inventory
- Filter by dietary preferences
- Get cooking instructions via AI

### Health
- Input and track health metrics
- View daily calorie/macro logs
- Get personalized health insights

## Privacy & Security

- **No Backend Server**: All processing happens in your browser
- **No Database**: Your data never touches external servers (except Gemini API)
- **API Key Only**: Requires only your Gemini API key for AI features
- **Local Data**: Full control over your personal information


## Contributing

Feel free to fork, modify, and improve Fridjy! Some areas for enhancement:
- Multiple user profiles
- Cloud sync via Firebase/Supabase
- Mobile app version
- Advanced nutritional analysis
- Weekly meal planning

## Get Started

### Prerequisites
- **Node.js** (v16 or higher)
- **Google Gemini API Key** (get one [here](https://ai.google.dev/))