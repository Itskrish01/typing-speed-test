# ⌨️ TypeSpeed - Ultimate Typing Test

A modern, beautiful, and highly customizable typing speed test application built with **React**, **TypeScript**, and **Tailwind CSS**. Designed to help you improve your typing speed and accuracy with a polished, distraction-free interface.

![TypeSpeed Banner](/public/logo/keyboard.png)

## ✨ Features

### 🎮 Game Modes
- **Words Mode**: Practice with a set number of words based on difficulty.
  - **Easy**: Simple, short lowercase words (e.g., "the", "and").
  - **Medium**: Technical and common web development terms.
  - **Hard**: Complex, long technical vocabulary (e.g., "polymorphism", "infrastructure").
- **Timed Mode**: Test how many words you can type in 60 seconds.
- **Custom Mode**: Paste your own text to practice specific paragraphs or code snippets.

### 🎨 Stunning Visuals & Themes
- **10+ Hand-crafted Themes**: Switch instantly between Light, Dark, System, Espresso, Midnight, Forest, Ruby, VS Code, Monochrome, Matrix, and Synthwave.
- **Smooth Caret**: A beautiful, animated yellow block cursor that glides smoothly across characters.
- **Smart Focus**: A "Click to Focus" overlay appears when you lose window focus so you never accidentally type into the void.

### 📊 Detailed Statistics
- **Real-time Stats**: Track your WPM (Words Per Minute), Accuracy, and Time remaining/elapsed live as you type.
- **High Score Tracking**: Automatically saves your personal bests for each difficulty level locally.
- **Visual Feedback**: Celebratory confetti animations when you break a new record!
- **Strict Accuracy**: Accuracy is calculated based on characters you've *ever* typed wrong, encouraging precision over speed-correction spamming.

### 🛠️ Tech Stack
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) + [Lucide Icons](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: CSS Transitions + `canvas-confetti`

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/itskrish01/typing-speed-test.git
    cd typing-speed-test
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

## 🎯 How to Play
1.  **Select Difficulty**: Choose between Easy, Medium, or Hard (or Custom).
2.  **Select Mode**: Toggle between "Words" (fixed count) or "Timed" (60s).
3.  **Start Typing**: The test begins automatically when you type the first character.
4.  **Restart**: Press `Tab` to quickly restart the test at any time.

## 🤝 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests to improve the app.

---
*Built with ❤️ by itsKrish01*
