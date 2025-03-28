'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Add dynamic export to prevent static generation
export const dynamic = 'force-dynamic';

interface FeedbackItem {
  _id: string;
  formType: string;
  name?: string;
  age?: number;
  gameFrequency?: string;
  accessExperience?: string;
  accessDifficulties?: string[];
  gameUnderstanding?: string;
  featureClarity?: string;
  confusingFeatures?: string;
  questionDifficulty?: string;
  rewardSystem?: string;
  rewardSuggestions?: string;
  improvementSuggestions?: string;
  errorFeedback?: string;
  wouldRetry?: string;
  createdAt: string;
}

function FeedbackAdminContent() {
  const searchParams = useSearchParams();
  const formType = searchParams.get('formType') || '';
  
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const url = `/api/feedback/list${formType ? `?formType=${formType}` : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch feedback');
        }
        
        const data = await response.json();
        setFeedbackList(data.data);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to load feedback data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedback();
  }, [formType]);

  if (loading) {
    return <div className="p-8 text-center">Loading feedback data...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (feedbackList.length === 0) {
    return <div className="p-8 text-center">No feedback submissions found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Feedback Submissions {formType && `- ${formType}`}</h1>
      
      <div className="space-y-8">
        {feedbackList.map((feedback) => (
          <div key={feedback._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {feedback.name || 'Anonymous'} ({feedback.age || 'Age not provided'})
              </h2>
              <div className="text-sm text-gray-500">
                {new Date(feedback.createdAt).toLocaleString()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Basic Information</h3>
                <p><span className="font-medium">Game Frequency:</span> {feedback.gameFrequency}</p>
                <p><span className="font-medium">Access Experience:</span> {feedback.accessExperience}</p>
                <p><span className="font-medium">Game Understanding:</span> {feedback.gameUnderstanding}</p>
                <p><span className="font-medium">Feature Clarity:</span> {feedback.featureClarity}</p>
                <p><span className="font-medium">Question Difficulty:</span> {feedback.questionDifficulty}</p>
                <p><span className="font-medium">Reward System:</span> {feedback.rewardSystem}</p>
                <p><span className="font-medium">Would Retry:</span> {feedback.wouldRetry}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Detailed Feedback</h3>
                
                {feedback.accessDifficulties && feedback.accessDifficulties.length > 0 && (
                  <div className="mb-2">
                    <p className="font-medium">Access Difficulties:</p>
                    <ul className="list-disc list-inside">
                      {feedback.accessDifficulties.map((difficulty, index) => (
                        <li key={index}>{difficulty}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {feedback.confusingFeatures && (
                  <div className="mb-2">
                    <p className="font-medium">Confusing Features:</p>
                    <p className="whitespace-pre-wrap">{feedback.confusingFeatures}</p>
                  </div>
                )}
                
                {feedback.rewardSuggestions && (
                  <div className="mb-2">
                    <p className="font-medium">Reward Suggestions:</p>
                    <p className="whitespace-pre-wrap">{feedback.rewardSuggestions}</p>
                  </div>
                )}
                
                {feedback.improvementSuggestions && (
                  <div className="mb-2">
                    <p className="font-medium">Improvement Suggestions:</p>
                    <p className="whitespace-pre-wrap">{feedback.improvementSuggestions}</p>
                  </div>
                )}
                
                {feedback.errorFeedback && (
                  <div className="mb-2">
                    <p className="font-medium">Error Feedback:</p>
                    <p className="whitespace-pre-wrap">{feedback.errorFeedback}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FeedbackAdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <FeedbackAdminContent />
    </Suspense>
  );
} 