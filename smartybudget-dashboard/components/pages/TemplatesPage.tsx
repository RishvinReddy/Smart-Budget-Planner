import React from 'react';
import { Target, PieChart, Repeat, PiggyBank, Sparkles } from 'lucide-react';
import { Page } from '../../App';

const TemplateCard = ({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick?: () => void }) => (
  <button onClick={onClick} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-left w-full h-full disabled:opacity-50 disabled:cursor-not-allowed">
    <div className="flex items-center gap-4 mb-3">
      <div className="bg-brand-purple-light text-brand-purple-dark p-3 rounded-full">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-600">{description}</p>
  </button>
);

interface TemplatesPageProps {
  setPage: (page: Page) => void;
}

const TemplatesPage: React.FC<TemplatesPageProps> = ({ setPage }) => {
  const templates = [
     {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'AI-Powered Budget Planner',
      description: 'Describe your goals and financial situation in plain English, and let our AI build a personalized budget for you.',
      action: () => setPage('ai-planner'),
    },
    {
      icon: <PieChart className="h-6 w-6" />,
      title: '50/30/20 Rule',
      description: 'A simple budgeting framework that allocates 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Zero-Based Budget',
      description: 'Give every single dollar a job. Your income minus your expenses, savings, and debt payments should equal zero.'
    },
    {
      icon: <PiggyBank className="h-6 w-6" />,
      title: 'Pay Yourself First',
      description: 'Prioritize saving by setting aside a specific amount for your savings goals before you start paying your monthly bills and expenses.'
    },
    {
      icon: <Repeat className="h-6 w-6" />,
      title: 'Envelope System',
      description: 'A cash-based system where you allocate physical cash into envelopes for different spending categories to prevent overspending.'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">Budgeting Templates</h1>
        <p className="text-lg text-gray-500 mt-2">Find a budgeting method that works for you, or let AI create one!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {templates.map(template => (
          <TemplateCard key={template.title} title={template.title} icon={template.icon} description={template.description} onClick={template.action} />
        ))}
      </div>
    </div>
  );
};

export default TemplatesPage;