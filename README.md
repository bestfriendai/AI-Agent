<div align="center">
  <img src="./assets/images/logo-mic.jpg" alt="AI-Agent Logo" width="120" height="120" style="border-radius: 20px;">
  
  # AI-Agent (Siora)
  
  **Your Personal AI-Powered Mindfulness Companion**

  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![LiveKit](https://img.shields.io/badge/LiveKit-3B82F6?style=for-the-badge&logo=webrtc&logoColor=white)](https://livekit.io/)
  [![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-project-structure">Structure</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

---

## 📝 Description

**AI-Agent** (Siora) is a cutting-edge, cross-platform mobile application designed to bring mindfulness and inner peace through AI-driven voice conversations. Built with **React Native** and **Expo**, it leverages **LiveKit** and **ElevenLabs** to create immersive, real-time audio experiences.

Whether you're looking for a guided meditation session in a "Forest Path" or a calming chat with a virtual companion, AI-Agent adapts to your mood and provides personalized interactions. With secure authentication via **Clerk** and robust data management using **Supabase**, your wellness journey is private, secure, and seamless.

## ✨ Features

- **🤖 AI Voice Conversations**: Real-time, low-latency voice interactions powered by LiveKit and ElevenLabs.
- **🧘‍♀️ Curated Sessions**: Choose from various themes like *Forest Path*, *Mountain View*, *Ocean Waves*, and *Zen Stones*.
- **📊 Progress Tracking**: View your session history, including duration, date, and "tokens" of wisdom collected.
- **🔐 Secure Authentication**: Seamless sign-up and sign-in flows using Clerk (Email, Google, Apple).
- **🎨 Modern UI/UX**:
  - **Parallax Scrolling**: Beautiful visual effects using `react-native-reanimated`.
  - **Glassmorphism**: Sleek, modern design elements.
  - **Smooth Animations**: Powered by Reanimated and Skia.
- **📱 Cross-Platform**: Optimized for both iOS and Android.

## 🛠️ Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | React Native (Expo) | Cross-platform mobile development |
| **Language** | TypeScript | Type-safe code |
| **Routing** | Expo Router | File-based routing |
| **Voice/Video** | LiveKit, ElevenLabs | Real-time audio & AI voice synthesis |
| **Auth** | Clerk | User authentication & management |
| **Backend** | Supabase | Database & backend services |
| **Styling** | StyleSheet, Expo Linear Gradient | Native styling & gradients |
| **Animations** | Reanimated, Skia | High-performance animations |
| **Lists** | FlashList | Fast & efficient list rendering |

## 📦 Key Dependencies

| Package | Version | Description |
| :--- | :--- | :--- |
| [`@clerk/clerk-expo`](https://clerk.com/docs/quickstarts/expo) | `^2.19.4` | **Authentication**: Secure user management and sign-in flows. |
| [`@elevenlabs/react-native`](https://elevenlabs.io/docs/api-reference/react-native-sdk) | `^0.5.2` | **AI Voice**: Realistic text-to-speech synthesis. |
| [`@livekit/react-native`](https://docs.livekit.io/client-sdk-react-native/) | `^2.9.5` | **Real-time**: Low-latency voice and video communication. |
| [`@supabase/supabase-js`](https://supabase.com/docs/reference/javascript/introduction) | `^2.39.0` | **Backend**: Database and real-time subscriptions. |
| [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/) | `~4.1.1` | **Animations**: High-performance, declarative animations. |
| [`expo`](https://docs.expo.dev/) | `~54.0.25` | **Framework**: The core platform for building universal apps. |

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** (LTS version recommended)
- **npm** or **yarn**
- **Expo Go** app on your phone OR Android Studio / Xcode for emulators.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/PrashantJaybhaye/AI-Agent.git
    cd AI-Agent
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your keys:
    ```env
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    EXPO_PUBLIC_SUPABASE_URL=https://...supabase.co
    EXPO_PUBLIC_SUPABASE_KEY=...
    # Add LiveKit and ElevenLabs keys if required by your implementation
    ```

4.  **Run the app**
    ```bash
    npx expo start
    ```

## 🏃‍♂️ Run Commands

| Command | Description |
| :--- | :--- |
| `npm run start` | Start the Expo development server |
| `npm run android` | Run on Android emulator/device |
| `npm run ios` | Run on iOS simulator/device |
| `npm run web` | Run on web browser |
| `npm run reset-project` | Reset the project to a clean state |
| `npm run lint` | Run ESLint to check code quality |

## 📁 Project Structure

```
AI-Agent/
├── app/
│   ├── (protected)/     # Authenticated routes
│   │   ├── session/     # Session-specific pages
│   │   ├── index.tsx    # Home dashboard
│   │   ├── profile.tsx  # User profile
│   │   └── summary.tsx  # Session summary
│   ├── (public)/        # Public routes
│   │   ├── index.tsx    # Landing page
│   │   └── sign-up.tsx  # Registration
│   ├── api/             # API route handlers
│   └── _layout.tsx      # Root layout configuration
├── components/
│   ├── clerk/           # Authentication components (SignIn, SignUp)
│   ├── screens/         # Screen-level components (SessionScreen, SummaryScreen)
│   ├── ParallaxScrollView.tsx # Custom scroll view with parallax effect
│   └── ProfileIcon.tsx  # User avatar component
├── hooks/
│   ├── useConversation.ts # Custom hook for LiveKit/ElevenLabs logic
│   └── ...
├── utils/
│   ├── supabase.ts      # Supabase SDK configuration
│   ├── sessions.ts      # Session data and types
│   └── colors.ts        # Design system colors
├── assets/
│   ├── images/          # App icons and logos
│   └── sessions/        # Session background images
└── ...config files
```

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable | Description | Required |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk Publishable Key | Yes |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase Project URL | Yes |
| `EXPO_PUBLIC_SUPABASE_KEY` | Supabase Anon Key | Yes |
| `EXPO_PUBLIC_LIVEKIT_URL` | LiveKit Server URL (if using custom) | No |
| `EXPO_PUBLIC_LIVEKIT_TOKEN` | LiveKit Token (for testing) | No |

## 🚧 Roadmap

- [x] **Core**: Voice conversations with AI.
- [x] **Auth**: Secure login with Clerk.
- [x] **UI**: Modern, animated interface.
- [ ] **History**: Advanced filtering and search for past sessions.
- [ ] **Settings**: Customizable voice and theme options.
- [ ] **Offline Mode**: Basic functionality without internet.

## ❓ Troubleshooting

**Issue: Metro Bundler not starting?**
> Try running `npx expo start -c` to clear the cache.

**Issue: Audio not working on Android?**
> Ensure you have granted microphone permissions. Check `app.json` for `android.permissions`.

**Issue: "Clerk: Missing Publishable Key"?**
> Verify your `.env` file is correctly named and located in the root. Restart the server after changing `.env`.

## 🤝 Contributing

Contributions are always welcome!

1.  **Fork** the repository.
2.  **Clone** your fork.
3.  **Create** a new branch (`git checkout -b feature/amazing-feature`).
4.  **Commit** your changes (`git commit -m 'Add some amazing feature'`).
5.  **Push** to the branch (`git push origin feature/amazing-feature`).
6.  **Open** a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made by <a href="https://github.com/PrashantJaybhaye">Prashant Jaybhaye</a>
</div>