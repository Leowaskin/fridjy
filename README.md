<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1pa6OFhYeVtNdqMX8Uoo8RDJSqIJ-dVNx

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


This is a purely frontend React application. Since there is no external database (like SQL, MongoDB, or Firebase) connected, all data is stored locally on your device using the Browser's localStorage API.

Here is a comprehensive walkthrough of the architecture and data flow.
1. Data Storage Strategy (localStorage)
The app persists data so that when you refresh the page or close the browser, your inventory and health stats remain.
Location: hooks/useInventory.ts and hooks/useHealth.ts.
How it works: When state changes (e.g., adding an item), the hook converts the JavaScript object to a JSON string and saves it to the browser.
Storage Keys:
eatAI_inventory: Stores the list of food items, expiry dates, etc.
eatAI_health_profile: Stores weight, height, BMI, allergies.
eatAI_health_logs: Stores daily calorie/macro history.
Pros: Fast, works offline, no login required, privacy-focused (data never leaves the device except to go to Gemini for analysis).
Cons: If you clear your browser cache, you lose the data. You cannot sync data between your phone and your laptop.

2. Architecture Overview
The app follows a Service-Oriented Frontend Architecture:
A. The "Brain" (Custom Hooks)
Instead of scattering logic inside UI components, state management is centralized in Hooks.
hooks/useInventory.ts:
Loads inventory from local storage on boot.
Exposes functions like addItem, removeItem, updateInventory.
Handles the synchronization between React State and LocalStorage.
hooks/useHealth.ts:
Manages the user's bio-data and daily food logs.
Calculates logic like aggregating daily calories.
B. The "Intelligence" (Services)
services/geminiService.ts:
This is the bridge to the Google Gemini API.
It does not store data. It is purely functional: Input (Image/Text) -> Processing -> Output (JSON Data).
Functions:
analyzeFridgeImage: Sends Base64 image -> Returns InventoryItem[].
generateRecipe: Sends inventory list -> Returns Recipe[] with macros.
generateMealPlan: Sends health profile -> Returns Markdown plan.
C. The "View" (Pages & Components)
App.tsx: Sets up the Router (navigation between pages).
pages/Scan.tsx:
Captures image (Camera/Upload).
Calls analyzeFridgeImage.
New Feature: Allows user to edit the result in a Modal.
Calls addItems from useInventory to save to LocalStorage.
pages/Recipes.tsx:
Reads inventory from useInventory.
Calls generateRecipe.
New Feature: When you click "I ate this", it calls addLog from useHealth to save macros to LocalStorage.
pages/Health.tsx:
Reads logs from useHealth.
Visualizes data using CSS-based bar charts.
Interacts with Gemini to generate text-based meal plans.

3. Data Flow Example: Scanning an Apple
User Action: User takes a photo of an Apple in Scan.tsx.
Service Call: Scan.tsx converts image to Base64 -> sends to geminiService.ts.
AI Processing: Gemini analyzes image, detects "Apple", estimates expiry (7 days), estimates fragility. Returns JSON.
User Confirmation: Scan.tsx shows the "Detected Items" list. User clicks "Edit", changes quantity from 1 to 2.
State Update: User clicks "Save". Scan.tsx calls addItems(newApple).
Storage: useInventory hook updates the React State (UI updates immediately) AND writes eatAI_inventory to localStorage.
Result: The user is redirected to Home.tsx, which re-renders because it is listening to useInventory, showing the Apple card.