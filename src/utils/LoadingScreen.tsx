"use client";

import React from "react";

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-center dark:bg-dark-bg space-y-6">
      {/* Circular Spinner */}
      <span className="loading loading-spinner loading-lg text-black"></span>

      {/* Text Section */}
      <div>
        <h2 className="text-xl font-semibold text-black">
          Fetching the latest stories...
        </h2>
        <p className="text-sm text-blue-500">
          Loading your daily dose of inspiration...
        </p>
      </div>

      {/* Progress Bar */}
      <progress className="progress text-blue-500 w-56"></progress>
    </div>
  );
}
