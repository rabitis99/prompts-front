import React from 'react';

interface PromptInputPanelProps {
  rawInput: string;
  onRawInputChange: (text: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
}

export const PromptInputPanel: React.FC<PromptInputPanelProps> = ({
  rawInput,
  onRawInputChange,
  category,
  onCategoryChange,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">Prompt Builder</h2>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-medium text-gray-700">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Select a category (Optional)...</option>
          <option value="MARKETING">Marketing</option>
          <option value="CODING">Coding</option>
          <option value="WRITING">Writing</option>
          <option value="DATA_ANALYSIS">Data Analysis</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="promptInput" className="text-sm font-medium text-gray-700">What do you want to create?</label>
        <textarea
          id="promptInput"
          value={rawInput}
          onChange={(e) => onRawInputChange(e.target.value)}
          placeholder="e.g. Write a persuasive email about..."
          className="w-full h-32 p-3 border rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );
};
