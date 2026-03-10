import React from 'react';
import { PromptCategory, PROMPT_CATEGORY_DISPLAY_NAMES } from '@/features/prompt/types/prompt.types';

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
      <h2 className="text-lg font-semibold text-gray-800">프롬프트 빌더</h2>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-medium text-gray-700">카테고리</label>
        <select
          id="category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">카테고리 선택 (선택사항)...</option>
          {Object.entries(PROMPT_CATEGORY_DISPLAY_NAMES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="promptInput" className="text-sm font-medium text-gray-700">무엇을 만들고 싶으신가요?</label>
        <textarea
          id="promptInput"
          value={rawInput}
          onChange={(e) => onRawInputChange(e.target.value)}
          placeholder="예: ...에 대한 설득력 있는 이메일 작성"
          className="w-full h-32 p-3 border rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );
};
