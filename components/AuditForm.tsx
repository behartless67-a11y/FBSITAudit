"use client";

import { useState } from 'react';
import { areas } from '@/data/questions';
import { Area, Question } from '@/types/audit';

interface AuditFormProps {
  userName: string;
  userEmail: string;
  userId: string;
}

export function AuditForm({ userName, userEmail, userId }: AuditFormProps) {
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [customName, setCustomName] = useState('');

  const handleAreaChange = (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    setSelectedArea(area || null);
    setResponses({});
    setSubmitMessage(null);
  };

  const handleResponseChange = (questionId: number, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const isFormComplete = () => {
    if (!selectedArea || !customName.trim()) return false;
    const requiredQuestions = selectedArea.questions.filter(q => q.required);
    return requiredQuestions.every(q => responses[q.id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedArea || !isFormComplete()) {
      setSubmitMessage({ type: 'error', text: 'Please answer all required questions.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

      const response = await fetch('/api/submit-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userName: customName.trim(),
          userEmail,
          areaId: selectedArea.id,
          areaName: selectedArea.name,
          responses,
          month: currentMonth,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit audit form');
      }

      const data = await response.json();

      setSubmitMessage({
        type: 'success',
        text: 'Audit form submitted successfully! Thank you for completing the monthly audit.'
      });

      // Reset form after successful submission
      setTimeout(() => {
        setSelectedArea(null);
        setResponses({});
        setCustomName('');
        setSubmitMessage(null);
      }, 3000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitMessage({
        type: 'error',
        text: 'Failed to submit audit form. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  let currentSection = '';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-uva-navy mb-2">Monthly Audit Questionnaire</h2>
          <div className="w-24 h-1 bg-uva-orange mx-auto mb-4"></div>
          <p className="text-gray-600">
            Please select your area and complete the monthly audit questions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-lg font-semibold text-uva-navy mb-3">
              Your Name <span className="text-uva-orange">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-uva-orange focus:outline-none transition-colors text-gray-700"
              required
            />
          </div>

          {/* Area Selection */}
          <div>
            <label htmlFor="area" className="block text-lg font-semibold text-uva-navy mb-3">
              Select Your Area <span className="text-uva-orange">*</span>
            </label>
            <select
              id="area"
              value={selectedArea?.id || ''}
              onChange={(e) => handleAreaChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-uva-orange focus:outline-none transition-colors text-gray-700 bg-white"
              required
            >
              <option value="">-- Select an area --</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          {/* Questions */}
          {selectedArea && (
            <div className="space-y-8 mt-8 animate-fade-in-up">
              <div className="border-t-2 border-gray-200 pt-6">
                {selectedArea.questions.map((question, index) => {
                  const showSection = question.section && question.section !== currentSection;
                  if (showSection) {
                    currentSection = question.section || '';
                  }

                  return (
                    <div key={question.id} className="mb-6">
                      {/* Section Header */}
                      {showSection && (
                        <div className="mb-6 mt-8 first:mt-0">
                          <h3 className="text-xl font-bold text-uva-navy mb-2">
                            Section: {question.section}
                          </h3>
                          <div className="w-16 h-1 bg-uva-orange"></div>
                        </div>
                      )}

                      {/* Question */}
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <label className="block">
                          <div className="flex items-start mb-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-uva-navy text-white rounded-full flex items-center justify-center font-bold mr-3">
                              {question.id}
                            </span>
                            <span className="text-gray-800 font-medium flex-1">
                              {question.text}
                              {question.required && (
                                <span className="text-uva-orange ml-1">*</span>
                              )}
                            </span>
                          </div>

                          <div className="ml-11 space-y-2">
                            {question.options.map(option => (
                              <label
                                key={option}
                                className="flex items-center p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-uva-orange transition-colors cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  value={option}
                                  checked={responses[question.id] === option}
                                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                  className="w-4 h-4 text-uva-orange focus:ring-uva-orange"
                                  required={question.required}
                                />
                                <span className="ml-3 text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Message */}
          {submitMessage && (
            <div
              className={`p-4 rounded-lg animate-fade-in ${
                submitMessage.type === 'success'
                  ? 'bg-green-50 text-green-800 border-2 border-green-200'
                  : 'bg-red-50 text-red-800 border-2 border-red-200'
              }`}
            >
              {submitMessage.text}
            </div>
          )}

          {/* Submit Button */}
          {selectedArea && (
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={!isFormComplete() || isSubmitting}
                className={`px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:transform-none ${
                  isFormComplete() && !isSubmitting
                    ? 'bg-uva-orange hover:bg-uva-orange-light text-white shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Audit Form'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
