
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 mt-12 border-t dark:border-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
                 <h2 className="text-2xl font-bold tracking-tighter text-gray-800 dark:text-gray-100 mb-2">
                    Smarty<span className="text-brand-purple-dark">Budget</span>
                </h2>
                <p className="text-gray-500 dark:text-gray-400">Take control of your finances.</p>
            </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li><a href="#" className="hover:text-brand-purple-dark dark:hover:text-brand-purple">Home</a></li>
              <li><a href="#" className="hover:text-brand-purple-dark dark:hover:text-brand-purple">All Templates</a></li>
              <li><a href="#" className="hover:text-brand-purple-dark dark:hover:text-brand-purple">About Us</a></li>
              <li><a href="#" className="hover:text-brand-purple-dark dark:hover:text-brand-purple">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li><a href="#" className="hover:text-brand-purple-dark dark:hover:text-brand-purple">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-purple-dark dark:hover:text-brand-purple">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand-purple-dark dark:hover:text-brand-purple">Refund Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Subscribe to our email list!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Stay notified of future products, discounts, and all other helpful information!</p>
            <form className="flex">
              <input type="email" placeholder="Email" className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-brand-purple dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <button type="submit" className="bg-brand-purple-dark text-white px-4 py-2 rounded-r-md hover:bg-brand-purple-dark/90">Sign up</button>
            </form>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm">
          <div className="mb-4 text-base text-gray-700 dark:text-gray-200 space-y-1">
            <p className="font-bold">Rishvin Reddy</p>
            <p>
              <a href="tel:9848723235" className="hover:text-brand-purple-dark dark:hover:text-brand-purple">9848723235</a>
              <span className="mx-2">|</span>
              <a href="mailto:rishvin18@gmail.com" className="hover:text-brand-purple-dark dark:hover:text-brand-purple">rishvin18@gmail.com</a>
            </p>
          </div>
          &copy; {new Date().getFullYear()}, SmartyBudget
        </div>
      </div>
    </footer>
  );
};

export default Footer;