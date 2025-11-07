
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">About SmartyBudget</h1>
        <p className="text-lg text-gray-500 mt-2">Your partner in financial clarity and success.</p>
      </div>
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          At SmartyBudget, we believe that managing your finances shouldn't be complicated or stressful. Our mission is to provide you with a powerful, intuitive, and beautiful tool that empowers you to take control of your money with confidence. We're passionate about helping people achieve their financial goals, whether it's getting out of debt, saving for a dream vacation, or building long-term wealth.
        </p>
        <p>
          Our dashboard is designed to give you a comprehensive overview of your financial life at a glance. We focus on clear visualizations and simple, editable categories so you can spend less time tracking and more time living. We're constantly working to improve SmartyBudget and add new features that make a real difference in your financial journey.
        </p>
        <p>
          Thank you for choosing SmartyBudget. We're excited to be a part of your path to financial freedom.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
