import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FeedPage from "./pages/FeedPage";
import ViewPage from "./pages/ViewPage";
import CollectionPage from "./pages/CollectionPage";
import Settings from "./pages/Settings";
import SettingsFeeds from "./pages/SettingsFeeds";
import SettingsImport from "./pages/SettingsImport";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/feed/:feedId" element={<FeedPage />} />
      <Route path="/view/:type" element={<ViewPage />} />
      <Route path="/collection/:tag" element={<CollectionPage />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/settings/feeds" element={<SettingsFeeds />} />
      <Route path="/settings/import" element={<SettingsImport />} />
    </Routes>
  );
}
