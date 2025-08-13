"use client";

import React from 'react';
import { CheckCircle, FileSpreadsheet, ImageIcon, Settings } from 'lucide-react';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
}

interface WorkflowProgressProps {
  currentStep: 'csv' | 'template' | 'editor';
  completedSteps: ('csv' | 'template' | 'editor')[];
  className?: string;
}

export function WorkflowProgress({ 
  currentStep, 
  completedSteps, 
  className = "" 
}: WorkflowProgressProps) {
  const steps: WorkflowStep[] = [
    {
      id: 'csv',
      title: 'Upload CSV Data',
      description: 'Upload recipient data',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      href: '/dashboard/upload-csv',
    },
    {
      id: 'template',
      title: 'Upload Template',
      description: 'Upload certificate background',
      icon: <ImageIcon className="w-5 h-5" />,
      href: '/dashboard/upload-template',
    },
    {
      id: 'editor',
      title: 'Create Certificates',
      description: 'Design and generate certificates',
      icon: <Settings className="w-5 h-5" />,
      href: '/dashboard/create',
    },
  ];

  const getStepStatus = (stepId: string) => {
    if (completedSteps.includes(stepId as 'csv' | 'template' | 'editor')) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isLast = index === steps.length - 1;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center space-x-3">
                {/* Step Circle */}
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                  ${status === 'completed' 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : status === 'current'
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-background border-muted text-muted-foreground'
                  }
                `}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                
                {/* Step Content */}
                <div className="flex flex-col">
                  <span className={`
                    text-sm font-medium
                    ${status === 'completed' || status === 'current' 
                      ? 'text-foreground' 
                      : 'text-muted-foreground'
                    }
                  `}>
                    {step.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {step.description}
                  </span>
                </div>
              </div>
              
              {/* Connector Line */}
              {!isLast && (
                <div className={`
                  flex-1 h-px mx-4 transition-all duration-200
                  ${completedSteps.includes(steps[index + 1].id as 'csv' | 'template' | 'editor') || index < steps.findIndex(s => s.id === currentStep)
                    ? 'bg-primary' 
                    : 'bg-border'
                  }
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
