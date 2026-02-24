"use client";
import React from "react";

interface CategoryFilterProps {
  categories: string[];
  subCategories: string[];
  selectedCategory: string;
  selectedSubCategory: string;
  onCategoryChange: (category: string) => void;
  onSubCategoryChange: (subCategory: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  subCategories,
  selectedCategory,
  selectedSubCategory,
  onCategoryChange,
  onSubCategoryChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Categories */}
      <div className="flex flex-wrap gap-2 lg:gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 lg:px-6 py-2 lg:py-3 rounded-full font-bold transition-all border-2 ${
              selectedCategory === category
                ? "bg-teal-500 text-white border-teal-600 shadow-[0_4px_0_0_#0d9488]"
                : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 shadow-sm hover:shadow-md"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Sub Categories */}
      <div className="flex flex-wrap gap-2 lg:gap-3">
        {subCategories.map((subCategory) => (
          <button
            key={subCategory}
            onClick={() => onSubCategoryChange(subCategory)}
            className={`px-4 lg:px-6 py-2 lg:py-3 rounded-full font-bold transition-all border-2 ${
              selectedSubCategory === subCategory
                ? "bg-teal-500 text-white border-teal-600 shadow-[0_4px_0_0_#0d9488]"
                : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 shadow-sm hover:shadow-md"
            }`}
          >
            {subCategory}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
