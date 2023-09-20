import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { NowPrice } from "./pages/public/Now-price";
import NowPriceAssets from "./pages/public/Now-price-assets";
import NotFound from "./pages/error/404";
import { PortFolioTracker } from './pages/portfolio/portfolio-tracker';
import TermsOfUse from './pages/notice/Terms-of-Use';
import PrivacyPolicy from './pages/notice/Privacy-Policy';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NowPrice />} />
        <Route path="/search/:currency" element={<NowPriceAssets />} />
        <Route path="/trading-view/:currency" element={<NowPriceAssets />} />
        <Route path="/portfolio" element={<PortFolioTracker />} />
        <Route path="*" element={<NotFound />} />
        <Route path='/terms' element={<TermsOfUse />} />
        <Route path='/privacy' element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
}
