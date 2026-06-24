'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { SkillCategory } from '@/types';

interface AddSkillModalProps {
  onClose: () => void;
  onAdd?: (skillName: string, category: SkillCategory) => void;
}

export default function AddSkillModal({ onClose, onAdd }: AddSkillModalProps) {
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState<SkillCategory>(SkillCategory.PROGRAMMING_LANGUAGE);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: SkillCategory.PROGRAMMING_LANGUAGE, label: 'Programming Language' },
    { value: SkillCategory.FRAMEWORK, label: 'Framework' },
    { value: SkillCategory.TOOL, label: 'Tool' },
    { value: SkillCategory.SOFT_SKILL, label: 'Soft Skill' },
    { value: SkillCategory.DOMAIN_KNOWLEDGE, label: 'Domain Knowledge' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!skillName.trim()) {
      setError('Please enter a skill name');
      return;
    }

    setIsSubmitting(true);

    try {
      if (onAdd) {
        await onAdd(skillName.trim(), category);
      }
      onClose();
    } catch (err) {
      setError('Failed to add skill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add New Skill</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Skill Name */}
          <div>
            <label
              htmlFor="skillName"
              className="block text-sm font-medium text-gray-700"
            >
              Skill Name
            </label>
            <input
              id="skillName"
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g., Python, React, Communication"
              className="input mt-2"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as SkillCategory)}
              className="input mt-2"
              disabled={isSubmitting}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            Manually added skills will be marked as &quot;claimed&quot; until verified
            through project completion.
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex flex-1 items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Skill
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
