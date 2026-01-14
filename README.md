# ⌨️ Tapixo

> Built for **The FM30 Hackathon Returns**

🔗 **Live Demo**: [tapixo.netlify.app](https://tapixo.netlify.app)


## 📖 The Progress

When I set out to build **Tapixo**, I didn't just want to create another typing test. I wanted to solve a personal frustration: most typing apps are either ugly and dated, or cluttered with ads and distractions.

I wanted something **minimal, beautiful, and blazing fast**. A tool that felt like a premium code editor.

But building a high-performance typing app in React came with its own set of unique engineering challenges. Here is how I learned, built, and overcame them.

---

## 🔧 The Technical Challenges (And How I Solved Them)

### 1. The "Re-render Hell" Problem
**The Challenge:** In a React application, updating state on every keystroke usually triggers a re-render of the entire component tree. When typing at 100+ WPM, this causes visible lag, making the caret feel "heavy" and unresponsive.

**The Solution:**
I ditched standard `useState` and React Context for **Zustand**.
- By using **atomic state management** and `useShallow` selectors, I ensured that only the specific components needing updates (like the current character or the WPM counter) re-render.
- The caret movement matches your typing speed perfectly, with zero input delay.

### 2. Judging "Strict Accuracy"
**The Challenge:** Most typing tests forgive you if you backspace and fix a mistake. I wanted to build a tool that encourages *precision*, not just speed-correction spamming.

**The Solution:**
I implemented a **Strict Accuracy Algorithm**.
- Instead of just comparing the final string, I track a `Set` of `errorIndices` in the state store.
- If you type a character wrong *once*, that index is permanently marked as "dirty" for that session.
- This forces users to slow down and type correctly the first time, which is better for building muscle memory.

### 3. The "Boring UI" Problem
**The Challenge:** Typing texts are usually white backgrounds with black text. I wanted Tapixo to feel like a personalized environment.

**The Solution:**
I built a robust **Theming System** using `next-themes` and Tailwind CSS variables.
- Users can switch instantly between **10+ themes** (like VS Code, Matrix, Sunset, and more).
- Every part of the UI, from the background to the confetti particles, adapts specifically to the active theme.

---

## ✨ Key Features

### 🎮 Game Modes
*   **Words Mode**: Practice with fixed sets of words (10, 25, 50, 100).
*   **Timed Mode**: The classic 60-second sprint.
*   **Custom Mode**: Paste your own text (great for practicing code snippets or specific articles).
*   **Code Mode**: Practice typing actual keywords from your preferred programming language.

### 🧠 Adaptive Difficulty
*   **Easy**: Common, short words.
*   **Medium**: Standard vocabulary.
*   **Hard**: Complex, technical, and long words (e.g., "polymorphism", "infrastructure").

### 📊 Vital Statistics
*   Real-time **WPM** & **Accuracy**.
*   **Personal Bests** saved locally and synced to the cloud when logged in.
*   **Visual Feedback**: Celebratory confetti when you break a record!

### ☁️ Cloud Features (Firebase)
*   **User Authentication**: Sign up and log in with email/password.
*   **Cloud Sync**: Your personal bests, test history, and theme preferences sync across devices.
*   **User Profiles**: Unique usernames and public profile cards.
*   **Test History**: View your past typing tests with detailed stats.
*   **Activity Heatmap**: Visualize your daily typing activity over time.

### 🎨 15+ Hand-Crafted Themes
Includes Light, Dark, Espresso, Midnight, Forest, Ruby, Synthwave, and more.

---

## 🛠️ Tech Stack

*   **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **Backend**: [Firebase](https://firebase.google.com/) (Authentication + Firestore)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Lucide Icons](https://lucide.dev/)
*   **Animations**: CSS Transitions + `canvas-confetti`

---

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

---

*Built with ❤️ by itsKrish01*
