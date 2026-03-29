import { Routes, Route } from "react-router-dom";
import Kids from "./pages/Kids";
import TeensContact from "./pages/TeensContact";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import PostFeed from "./pages/PostFeed";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/kids" element={<Kids />} />
      <Route path="/teens/contact" element={<TeensContact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/feed" element={<PostFeed />} />
    </Routes>
  );
}