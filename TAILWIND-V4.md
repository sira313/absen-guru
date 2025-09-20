# Tailwind CSS v4 Migration Guide

Panduan migrasi ke Tailwind CSS v4 yang menggunakan pendekatan baru tanpa `tailwind.config.js`.

## 🚀 Perubahan Utama

### 1. **No More Config Files**
```bash
# File yang dihapus:
❌ tailwind.config.js
❌ postcss.config.js
```

### 2. **New Import System**
```css
/* app.css - Tailwind v4 approach */
@import "tailwindcss";
@import "daisyui";
```

### 3. **Theme via @theme**
```css
@theme {
  --color-primary: #3b82f6;
  --color-secondary: #10b981;
  --animate-fade-in: fadeIn 0.3s ease-in-out;
}
```

### 4. **Vite Plugin Integration**
```js
// vite.config.js
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    tailwindcss()  // ← Tailwind v4 plugin
  ]
});
```

## 📦 Dependencies Update

```json
{
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0-alpha.18",
    "tailwindcss": "^4.0.0-alpha.18",
    "daisyui": "^5.1.13"
  }
}
```

## ✨ Benefits

### **Simplified Setup**
- ❌ No more complex config files
- ✅ Everything in CSS
- ✅ Better hot reload
- ✅ Faster compilation

### **CSS-First Approach**
```css
/* Define custom values directly in CSS */
@theme {
  --spacing-attendance: 1.5rem;
  --color-absen-primary: #3b82f6;
}

/* Use them in components */
.attendance-card {
  padding: theme(--spacing-attendance);
  background: theme(--color-absen-primary);
}
```

### **Better DaisyUI Integration**
```css
/* DaisyUI works seamlessly */
@import "tailwindcss";
@import "daisyui";  /* Just import, no config needed */
```

## 🔄 Migration Steps

### 1. **Remove Old Files**
```bash
rm tailwind.config.js postcss.config.js
```

### 2. **Update Dependencies**
```bash
pnpm add -D @tailwindcss/vite@^4.0.0-alpha.18 tailwindcss@^4.0.0-alpha.18
pnpm remove autoprefixer postcss
```

### 3. **Update Vite Config**
```js
import tailwindcss from '@tailwindcss/vite';
// Add to plugins array
```

### 4. **Update CSS**
```css
/* Replace */
@tailwind base;
@tailwind components; 
@tailwind utilities;

/* With */
@import "tailwindcss";
@import "daisyui";
```

### 5. **Move Theme to @theme**
```css
@theme {
  /* Your custom theme variables */
}
```

## 🎨 Custom Theme Example

```css
@theme {
  /* Colors for absen app */
  --color-primary: #3b82f6;
  --color-secondary: #10b981;
  --color-accent: #f59e0b;
  
  /* Custom spacing */
  --spacing-card: 1.5rem;
  --spacing-form: 1rem;
  
  /* Animations */
  --animate-fade-in: fadeIn 0.3s ease-in-out;
  --animate-slide-up: slideUp 0.4s ease-out;
}
```

## 🛠️ Development Experience

### **Faster Builds**
- Tailwind v4 compiles significantly faster
- Better tree-shaking
- Smaller CSS output

### **Better IntelliSense**
- VS Code Tailwind extension works better
- Better autocomplete for custom theme values

### **Hot Reload**
- Instant updates when changing CSS
- No need to restart dev server

## 🔍 Troubleshooting

### **Import Errors**
Make sure you have the alpha version:
```bash
pnpm list tailwindcss
# Should show 4.0.0-alpha.18
```

### **DaisyUI Not Working**
Ensure correct import order:
```css
@import "tailwindcss";  /* First */
@import "daisyui";      /* Second */
```

### **Theme Variables Not Working**
Use correct syntax:
```css
@theme {
  --color-custom: #ff0000;  /* Correct */
  custom-color: #ff0000;    /* ❌ Wrong */
}
```

---

Tailwind CSS v4 memberikan developer experience yang lebih modern dengan setup yang lebih sederhana dan performa yang lebih baik!