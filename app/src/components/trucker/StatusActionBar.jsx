import React from 'react';

const StatusActionBar = ({ bid, onStatusUpdate }) => {
  const statusSteps = [
    { status: 'loaded', label: 'Loaded', color: 'blue' },
    { status: 'in transit', label: 'In Transit', color: 'orange' },
    { status: 'delivered', label: 'Delivered', color: 'green' }
  ];

  const getCurrentStepIndex = () => {
    if (bid.status === 'accepted') return -1;
    return statusSteps.findIndex(step => step.status === bid.status);
  };

  return (
    <div className="mt-6 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Update Status</h3>
      <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
        {statusSteps.map((step, index) => {
          const currentStep = getCurrentStepIndex();
          const isCompleted = index <= currentStep;
          const isActive = index === currentStep;
          const isNextStep = index === currentStep + 1;
          
          return (
            <div key={step.status} className="flex-1 relative">
              {index < statusSteps.length - 1 && (
                <div className={`absolute top-1/2 left-1/2 w-full h-1 transform -translate-y-1/2
                  ${isCompleted ? `bg-${step.color}-500` : 'bg-gray-300 dark:bg-gray-600'}`}
                />
              )}
              
              <div className="relative flex flex-col items-center">
                <button
                  onClick={() => onStatusUpdate(bid.requestID, step.status)}
                  disabled={!isNextStep && !isActive}
                  className={`
                    w-32 px-4 py-2 rounded-full
                    transition-all duration-200 
                    ${isCompleted 
                      ? `bg-${step.color}-500 text-white hover:bg-${step.color}-600` 
                      : isNextStep
                        ? `bg-${step.color}-100 text-${step.color}-700 hover:bg-${step.color}-200 cursor-pointer`
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                    }
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${step.color}-500
                    ${isActive ? `ring-2 ring-${step.color}-500 ring-offset-2` : ''}
                  `}
                >
                  {step.label}
                </button>
                
                <div className={`
                  mt-2 w-3 h-3 rounded-full
                  ${isCompleted 
                    ? `bg-${step.color}-500` 
                    : 'bg-gray-300 dark:bg-gray-600'
                  }
                `} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusActionBar; 