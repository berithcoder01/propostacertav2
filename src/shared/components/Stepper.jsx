import React from 'react';
import { motion } from 'framer-motion';

// Props:
// steps: [{ number: 1, label: "Empresa" }, ...]
// currentStep: number
// variant: "onboarding" | "wizard"
const Stepper = ({ steps = [], currentStep = 1, variant = 'onboarding' }) => {
  return (
    <div className="w-full">
      {variant === 'onboarding' ? (
        // Estilo para onboarding — pills conectadas
        <div className="flex items-center gap-2 md:gap-3">
          {steps.map((step, idx) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            const isFirst = idx === 0;
            const isLast = idx === steps.length - 1;

            return (
              <React.Fragment key={step.number}>
                {/* Conector */}
                {idx > 0 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                    className={`h-[3px] rounded-full flex-shrink-0 transition-colors duration-300 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-border'
                    }`}
                    style={{ width: isFirst || isLast ? '1.5rem' : '2.5rem' }}
                  />
                )}

                {/* Step */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative flex flex-col items-center gap-1`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                      transition-all duration-300
                      ${isActive
                        ? 'bg-emerald-500 text-white shadow-glow scale-110'
                        : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-600'
                          : 'bg-border text-muted'
                      }`}
                  >
                    {isCompleted ? '✓' : step.number}
                  </div>
                  <span
                    className={`text-[10px] font-medium transition-colors duration-300 ${
                      isActive ? 'text-emerald-600' : 'text-muted'
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        // Estilo para wizard — barra de progresso
        <div className="w-full">
          <div className="flex justify-between mb-2">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    step.number <= currentStep ? 'bg-emerald-500 shadow-glow' : 'bg-border'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors duration-300 ${
                    step.number <= currentStep ? 'text-emerald-600' : 'text-muted'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-brand rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
              }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Stepper;