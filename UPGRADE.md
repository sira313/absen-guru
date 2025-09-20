# Upgrade Guide: DaisyUI 5.1.13 & TailwindCSS 4.1

Panduan ini menjelaskan perubahan dari versi sebelumnya ke DaisyUI 5.1.13 dan TailwindCSS 4.1.

## 🚀 Upgrade Steps

### 1. Update Dependencies
```bash
# Update dependencies
pnpm update daisyui tailwindcss

# Or install specific versions
pnpm install -D daisyui@5.1.13 tailwindcss@4.1
```

### 2. Enhanced Theme Configuration
DaisyUI 5.1.13 memiliki dukungan theme yang lebih baik dengan `*-content` colors:

```js
// tailwind.config.js - Enhanced theme
daisyui: {
  themes: [
    {
      absen: {
        "primary": "#3B82F6",
        "primary-content": "#ffffff",    // ← Baru
        "secondary": "#10B981", 
        "secondary-content": "#ffffff",  // ← Baru
        // ... dan seterusnya
      }
    }
  ]
}
```

### 3. Improved CSS Structure
Menggunakan `@layer` untuk better organization:

```css
/* app.css - Dengan @layer */
@layer components {
  .attendance-card {
    @apply card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-200;
  }
  
  .status-hadir {
    @apply badge-success text-success-content;  /* ← content colors */
  }
}
```

### 4. PostCSS Configuration
Updated untuk ES modules:

```js
// postcss.config.js
export default {  // ← Changed from module.exports
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## ✨ New Features Available

### DaisyUI 5.1.13 Features
- **Improved contrast ratios** untuk accessibility
- **Better color palette** dengan `*-content` variants
- **Enhanced component variants** 
- **Improved dark mode support**
- **Better RTL support** (future-ready untuk Indonesia)

### TailwindCSS 4.1 Features
- **Improved performance** dengan better CSS generation
- **Enhanced animation utilities**
- **Better container queries support**
- **Improved arbitrary value support**

## 🎨 Enhanced Custom Classes

New custom classes available:

```css
/* Button variants */
.btn-absen-primary {
  @apply btn btn-primary hover:scale-105 transition-transform duration-200;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out;
}
```

## 📝 Migration Notes

### Content Colors
Sekarang bisa menggunakan content colors untuk contrast yang lebih baik:

```html
<!-- Before -->
<span class="badge badge-success">Hadir</span>

<!-- After -->
<span class="badge badge-success text-success-content">Hadir</span>
```

### Animation Improvements
TailwindCSS 4.1 memberikan animation utilities yang lebih smooth:

```html
<!-- Enhanced animations -->
<div class="card animate-fade-in hover:scale-105 transition-transform duration-200">
  <div class="card-body animate-slide-up">
    <!-- Content -->
  </div>
</div>
```

## 🔧 Development Experience

### VS Code Extensions
Recommended extensions di `.vscode/extensions.json`:
- `svelte.svelte-vscode`
- `bradlc.vscode-tailwindcss`
- `esbenp.prettier-vscode`

### PostCSS Recognition
File `.vscode/settings.json` configured untuk mengenali PostCSS dengan baik.

## ⚡ Performance Benefits

- **Faster CSS compilation** dengan TailwindCSS 4.1
- **Better tree-shaking** untuk smaller bundle sizes
- **Improved hot reload** di development mode
- **Better caching** untuk production builds

## 🛠️ Troubleshooting

### CSS @apply Errors in VS Code
Ini normal jika Tailwind extension belum terinstall. Install extension:
```bash
code --install-extension bradlc.vscode-tailwindcss
```

### Pnpm Lock File
Setelah upgrade, regenerate lock file:
```bash
rm pnpm-lock.yaml
pnpm install
```

### Theme Not Loading
Clear cache dan rebuild:
```bash
pnpm clean  # if available
rm -rf .svelte-kit
pnpm dev
```

---

Upgrade ini memberikan foundation yang lebih solid untuk pengembangan aplikasi absen-guru dengan design system yang lebih konsisten dan performa yang lebih baik.