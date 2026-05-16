import React from 'react';
import { Check } from 'lucide-react';

const Stepper = ({ current, steps, onStepClick }) => {
  return (
    <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-4 no-scrollbar">
      {steps.map((step, i) => (
        <div 
          key={i} 
          className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''} cursor-pointer hover:opacity-90`}
          onClick={() => onStepClick && onStepClick(i)}
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
            i < current 
              ? 'bg-success text-white' 
              : i === current 
                ? 'bg-accent text-white shadow-[0_0_0_4px_rgba(37,99,235,0.2)]' 
                : 'bg-border text-muted'
          }`}>
            {i < current ? <Check size={18} strokeWidth={3} /> : i + 1}
          </div>
          <span 
            className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap hidden sm:block ${
              i === current ? 'text-white' : 'text-muted'
            }`}
          >
            {step}
          </span>
          {i < steps.length - 1 && (
            <div 
              className={`flex-1 h-[2px] mx-4 min-w-[20px] transition-colors duration-500 ${
                i < current ? 'bg-success' : 'bg-border'
              }`} 
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Stepper;
