import { motion } from 'framer-motion'
import { CheckCircle, Circle, ExternalLink } from 'lucide-react'

export default function TaskStep({ step, index, isCompleted }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-border"
    >
      <div className="flex-shrink-0 mt-1">
        {isCompleted ? (
          <CheckCircle className="w-6 h-6 text-accent" />
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center">
            <span className="text-xs text-muted">{index + 1}</span>
          </div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-text-primary">{step.text}</p>
        {step.actionLabel && step.actionUrl && (
          <a
            href={step.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-sm text-accent hover:text-accent-hover transition-colors"
          >
            {step.actionLabel}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </motion.div>
  )
}
