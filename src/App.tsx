import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/auth-context";
import { ProtectedRoute } from "./components/layout/protected-route";
import { Login } from "./pages/auth/login";
import { Profile } from "./pages/profile/profile";
import { PublicProfileCard } from "./pages/profile/public-card";
import { UserDataSync } from "./components/user-data-sync";
import { ThemeProvider } from "./components/theme-provider";
import { Home } from "./pages/home/home";
import { Settings } from "./pages/settings/settings";
import { Leaderboard } from "./pages/leaderboard/leaderboard";
import { Result } from "./pages/result/result";
import { SoundProvider } from "./hooks/use-sound";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <SoundProvider>
          <UserDataSync>
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/result" element={<Result />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/u/:userId" element={<PublicProfileCard />} />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
              </Routes>
            </Router>
          </UserDataSync>
        </SoundProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
