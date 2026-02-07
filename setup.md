## Get Started

### Prerequisites
- **Node.js** (v16 or higher)
- **Google Gemini API Key** (get one [here](https://ai.google.dev/))

### Installation & Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   cd fridjy-application
   npm install
   ```

2. **Set up your API key:**
   Create a `.env.local` file in the `fridjy-application` directory:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🚦 Development

### Available Scripts

```bash
npm run dev     # Start development server on http://localhost:5173
npm run build   # Create optimized production build
npm run preview # Preview production build locally
```

### Code Style

The project uses:
- TypeScript for type safety
- React Hooks for state management
- Tailwind CSS for styling
- Component-based architecture

## Environment Variables

Create a `.env.local` file in `fridjy-application/`:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Important**: Never commit your `.env.local` file to version control.

## Troubleshooting

**Issue**: "Cannot find type definition file for 'node'"
- **Solution**: Run `npm install --save-dev @types/node`

**Issue**: API key errors
- Verify your `.env.local` file exists and has the correct key
- Check that the key has proper permissions in Google AI Studio

**Issue**: localStorage data not persisting
- Check browser privacy settings
- Ensure cookies/storage are enabled
- Clear browser cache and try again