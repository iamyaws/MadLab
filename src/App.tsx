import { PhoneShell } from './components/ui/PhoneShell';

export function App() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <PhoneShell>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display font-black text-ink text-5xl leading-none tracking-tight">
            Mad Inventor Lab
          </h1>
          <p className="font-script text-ink-soft text-2xl mt-4">
            Hello, Tüftler!
          </p>
        </div>
      </PhoneShell>
    </div>
  );
}
