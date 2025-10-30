# 📱 Zchan Mobile

**Uncensorable message boards on Zcash blockchain**

Anonymous • Immutable • Private

---

## 🎯 What is This?

Zchan Mobile is a **native iOS/Android app** with an integrated Zcash wallet that lets users post and read messages stored on the Zcash blockchain as shielded transaction memos.

**Key Features:**
- 🔐 **Built-in wallet** - User controls private keys
- 💬 **Send messages** - As shielded transactions with memos
- 📖 **Read messages** - Scan blockchain for channel activity
- 🎨 **Terminal UI** - Retro green phosphorescent design
- 🔒 **Max security** - Biometric auth, encrypted storage

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Expo CLI
- iOS: Xcode + CocoaPods
- Android: Android Studio

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

---

## 📁 Project Structure

```
zchan-mobile/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Terminal/   # Terminal-style components
│   │   ├── Messages/   # Message display
│   │   └── Wallet/     # Wallet UI
│   │
│   ├── screens/        # App screens
│   │   ├── Onboarding/ # Wallet creation
│   │   ├── Home/       # Channel list
│   │   ├── Channel/    # Message board
│   │   └── Settings/   # App settings
│   │
│   ├── services/       # Business logic
│   │   ├── WalletService.ts
│   │   ├── TransactionService.ts
│   │   └── MessageService.ts
│   │
│   ├── hooks/          # Custom hooks
│   ├── store/          # Zustand state
│   ├── types/          # TypeScript types
│   └── constants/      # Config & constants
│
├── assets/             # Fonts, images
└── App.tsx             # Entry point
```

---

## 🔐 Security

- **Non-custodial** - You control your keys
- **Encrypted storage** - Device keystore (Secure Enclave/Android Keystore)
- **Biometric auth** - Face ID / Fingerprint required
- **Shielded by default** - All transactions use z-addresses
- **Open source** - Full transparency

See [SECURITY.md](../zchan/SECURITY.md) for details.

---

## 🎨 Design

**Terminal Theme:**
- Font: VT323 (monospace)
- Colors: Green (#00ff00) on black (#0a0a0a)
- Effects: CRT scanlines, glow
- Inspired by: Old-school terminals, Matrix, hacker aesthetic

---

## 🧪 Current Status

**✅ Completed:**
- Project setup
- Terminal UI components
- Channel configuration
- Color scheme & constants

**🚧 In Progress:**
- Zcash SDK integration
- Wallet creation flow
- Message sending
- Blockchain scanning

**📅 Coming Soon:**
- Biometric authentication
- Real transaction support
- Message persistence
- Push notifications

---

## 🛠️ Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building
```bash
# iOS
npm run build:ios

# Android
npm run build:android
```

---

## 📚 Documentation

- [Architecture](../zchan/ARCHITECTURE.md)
- [Security](../zchan/SECURITY.md)
- [Getting Started](../zchan/GETTING_STARTED.md)

---

## 🤝 Contributing

This is an open-source project. Contributions welcome!

1. Fork the repo
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - See LICENSE file

---

## 🔗 Links

- [Web Prototype](../zchan)
- [Zcash](https://z.cash)
- [Zashi Wallet](https://zashi.app)
- [GitHub](https://github.com/Kenbak/zchan)

---

**Built with 💚 for privacy and free speech**

*"The revolution will not be censored."*
