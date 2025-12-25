import React from 'react';

const ExampleCard = ({ title, role, children }) => (
  <div className={`glass-float p-6 md:p-8 ${role ? `role-${role}` : ''} max-w-sm`}>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <div className="text-sm text-slate-600 dark:text-slate-300">{children}</div>
    <div className="mt-4 flex gap-3">
      <button className="btn-primary">Primary</button>
      <button className="btn-secondary">Secondary</button>
    </div>
  </div>
);

const StyleGuide = () => {
  return (
    <div className="container-breath section-spacing">
      <h1 className="text-4xl font-bold mb-8">Design Tokens & Utilities — Style Guide</h1>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="p-6 rounded-xl glass-light">
          <h2 className="text-xl font-semibold mb-3">Role Buttons</h2>
          <div className="flex flex-col gap-4">
            <div className="role-buyer">
              <button className="btn-primary glow-buyer dark:animate-glow-pulse">Buyer CTA</button>
            </div>
            <div className="role-seller">
              <button className="btn-primary glow-seller dark:animate-glow-pulse">Seller CTA</button>
            </div>
            <div className="role-agent">
              <button className="btn-primary glow-agent dark:animate-glow-pulse">Agent CTA</button>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl glass-medium">
          <h2 className="text-xl font-semibold mb-3">Glass Layers</h2>
          <div className="flex flex-col gap-4">
            <div className="glass-light p-4">Light Glass</div>
            <div className="glass-medium p-4">Medium Glass</div>
            <div className="glass-heavy p-4">Heavy Glass</div>
          </div>
        </div>

        <div className="p-6 rounded-xl glass-heavy">
          <h2 className="text-xl font-semibold mb-3">Shadows & Elevation</h2>
          <div className="flex flex-col gap-4">
            <div className="shadow-lift p-4 rounded">Shadow Lift</div>
            <div className="shadow-lift-lg p-4 rounded">Shadow Lift Large</div>
            <div className="shadow-lift-xl p-4 rounded">Shadow Lift XL</div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Sample Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ExampleCard title="Buyer Card" role="buyer">Use `glow-buyer` on hover and `from-buyer-gradient-from` for accents.</ExampleCard>
          <ExampleCard title="Seller Card" role="seller">Use `glow-seller` and `glass-medium` for panels.</ExampleCard>
          <ExampleCard title="Agent Card" role="agent">Agent CTAs can use `glow-agent` with `shadow-neumorphic`.</ExampleCard>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Animations</h2>
        <div className="flex gap-6 items-center">
          <div className="w-40 h-40 rounded-full bg-gradient-to-r from-buyer-gradient-from via-buyer-gradient-via to-buyer-gradient-to animate-morph" />
          <div className="w-40 h-40 rounded bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to animate-parallax-slow" />
          <div className="w-40 h-40 rounded bg-slate-200 dark:bg-slate-800 animate-particle-float" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">3D Transform Playground</h2>
        <div className="perspective-1000 inline-block p-6">
          <div className="transform-style-3d transition-transform hover:rotate-y-6 hover:-rotate-x-3 bg-white/40 dark:bg-slate-800/60 p-8 rounded-2xl shadow-neumorphic backface-hidden">
            <h3 className="font-semibold">3D Card</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Hover to see a subtle 3D rotation.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StyleGuide;
