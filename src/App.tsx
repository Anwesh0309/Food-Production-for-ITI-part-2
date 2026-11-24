import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { initGlobalClickSound } from '@/utils/sound';

const Home = lazy(() => import('@/pages/Home'));
const UnitPage = lazy(() => import('@/pages/UnitPage'));

export default function App() {
  useEffect(() => {
    const cleanup = initGlobalClickSound();
    return cleanup;
  }, []);

  return (
    <Layout>
      <Suspense fallback={<div className="py-20 text-center text-sm text-ink-400">…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/unit/:id" element={<UnitPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
