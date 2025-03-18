import React from "react";

const Loader = () => (
  <div className="flex justify-center items-center space-x-2">
    <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping delay-150"></div>
    <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping delay-300"></div>
  </div>
);

export default Loader;
