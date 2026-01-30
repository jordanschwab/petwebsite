import '@/styles/globals.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages (to be created)
// import Landing from '@/pages/Landing';
// import Dashboard from '@/pages/Dashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<div>Landing Page (Coming Soon)</div>} />
          <Route path="/dashboard" element={<div>Dashboard (Coming Soon)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
