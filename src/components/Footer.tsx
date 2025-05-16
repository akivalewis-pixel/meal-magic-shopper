
import React from "react";

export const Footer = () => {
  return (
    <footer className="bg-gray-100 py-6">
      <div className="container mx-auto text-center">
        <p className="text-gray-600">
          Family Meal Planner &copy; {new Date().getFullYear()} 
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Plan your meals, organize your shopping, feed your family with ease
        </p>
      </div>
    </footer>
  );
};
