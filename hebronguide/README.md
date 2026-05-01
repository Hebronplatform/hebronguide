# HebronGuide Seattle

시애틀 정착 가이드 PWA — 이민자·이주자·관광객을 위한 완벽한 시애틀 생활 안내서

## 🌟 Features

- **🏠 홈**: 시애틀 개요, 날씨, 인구, 렌트 정보
- **🛬 정착**: 1주차/1개월/3개월 단계별 정착 가이드
- **⛪ 교회**: 시애틀 한인 교회 정보 및 커뮤니티 프로그램
- **🍽️ 맛집**: 한인 카페, 맛집, 한인상권, 쇼핑 정보
- **🌆 탐방**: 지역안내, 자연·여행, 문화·예술, 스포츠
- **🆘 도움**: 긴급연락처, 커뮤니티, 유용한 링크

## 🎨 Design System

- **Dark Theme**: Background #0d1117
- **Accent Colors**: Gold #C9A227, Mint #6EE7B7
- **Responsive**: Mobile 430px → Tablet 768px → Desktop 1200px
- **PWA**: Progressive Web App with offline support

## 🌐 i18n Support

- 🇺🇸 English
- 🇰🇷 한국어
- 🇪🇸 Español

## 🚀 Tech Stack

- **React** 18.3.1 + TypeScript
- **Vite** 6.3.5
- **Tailwind CSS** 4.1.12
- **React Router** 7.13.0
- **Lucide React** (Icons)
- **Supabase** (Backend & Database)
- **Vite PWA Plugin**

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## 🌍 Environment Variables

Create `.env` file in root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 PWA Installation

1. Visit the deployed site on mobile device
2. Tap browser menu → "Add to Home Screen"
3. App icon appears on home screen
4. Works offline with Service Worker

## 🔧 Development

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:5173)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📁 Project Structure

```
/src
  /app
    /components
      HebronGuide.tsx      # Main app component
      AdminPage.tsx        # Admin panel
      Roadmap.tsx          # Development roadmap
      I18nContext.tsx      # i18n provider
      ContentContext.tsx   # Supabase content provider
    App.tsx                # Router entry point
    routes.tsx             # Route configuration
  /imports                 # Assets (icons, images)
  /styles
    theme.css              # Design tokens
    fonts.css              # Font imports
/supabase
  /functions/server        # Edge functions
```

## 🎯 Roadmap

- [x] Phase 1: Core UI & PWA Setup
- [ ] Phase 2: Deployment (Vercel)
- [ ] Phase 3: Admin CMS Enhancement
- [ ] Phase 4: User Auth & Personalization
- [ ] Phase 5: Community Features

## 📄 License

MIT License - Free to use for community projects

## 👨‍💻 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📞 Contact

For questions or suggestions, please open an issue on GitHub.

---

Made with ❤️ for the Seattle Korean community
