import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-accent-light dark:border-accent-dark">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 md:order-2">
            <a
              href="#"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-hover dark:hover:text-primary"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-hover dark:hover:text-primary"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-hover dark:hover:text-primary"
            >
              Contact Us
            </a>
          </div>

          <div className="flex justify-center space-x-6 md:order-3">
            <a
              href="#"
              className="text-gray-500 hover:text-primary-hover dark:text-gray-400 dark:hover:text-primary"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.46 6.54c-.81.36-1.68.61-2.59.71a4.54 4.54 0 0 0 1.99-2.5 9.17 9.17 0 0 1-2.86 1.09 4.52 4.52 0 0 0-7.7 4.12A12.83 12.83 0 0 1 3.32 5.09a4.51 4.51 0 0 0 1.4 6.02 4.49 4.49 0 0 1-2.05-.57v.06a4.52 4.52 0 0 0 3.63 4.44c-.67.18-1.38.21-2.05.08a4.53 4.53 0 0 0 4.23 3.14 9.07 9.07 0 0 1-6.61 2.21A12.77 12.77 0 0 0 19.5 8.29c0-.19 0-.38-.01-.57.86-.62 1.6-1.4 2.19-2.28z"></path>
              </svg>
            </a>

            <a
              href="#"
              className="text-gray-500 hover:text-primary-hover dark:text-gray-400 dark:hover:text-primary"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
              </svg>
            </a>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 md:order-1">
            © 2024 Tech Insights. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
