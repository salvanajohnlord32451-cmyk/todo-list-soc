import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-medium text-gray-600 animate-pulse">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
