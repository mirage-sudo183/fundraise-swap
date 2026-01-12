import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Bell, Shield, ChevronRight, ArrowLeft } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Bell, label: 'Notifications', value: 'On' },
    { icon: Shield, label: 'Privacy & Security', value: '' },
    { icon: User, label: 'Account', value: 'founder@example.com' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground max-w-md mx-auto flex flex-col">
      <header className="p-4 flex items-center gap-4 border-b border-border/50">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Settings</h1>
      </header>

      <main className="flex-1 p-4 space-y-6">
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">App Settings</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            {menuItems.map((item, idx) => (
              <button key={idx} className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground">
                    <item.icon size={20} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm">{item.value}</span>
                  <ChevronRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </section>

        <button 
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center gap-2 p-4 text-destructive hover:bg-destructive/10 rounded-xl transition-colors font-medium"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </main>
      
      <div className="p-6 text-center">
        <p className="text-xs text-muted-foreground">Version 1.0.0 (Beta)</p>
      </div>
    </div>
  );
}