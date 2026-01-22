'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

interface PollOption {
  id: string;
  text: string;
}

interface PollProps {
  pollId: string;
  question: string;
  options: PollOption[];
  initialVotes: Record<string, number>;
  userVote: string | null;
  user: User | null;
  voterAvatars?: string[];
}

export function Poll({ pollId, question, options, initialVotes, userVote: initialUserVote, user, voterAvatars = [] }: PollProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  const handleVote = async (optionId: string) => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (loading) return;

    setLoading(true);
    const { error } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: pollId,
        user_id: user.id,
        option_id: optionId
      } as any);

    if (error) {
      alert('Error voting: ' + error.message);
    } else {
      setUserVote(optionId);
      setVotes(prev => ({
        ...prev,
        [optionId]: (prev[optionId] || 0) + 1
      }));
    }
    setLoading(false);
  };

  const getPercentage = (count: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((count / totalVotes) * 100);
  };

  return (
    <div className="my-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question}</h3>
      
      <div className="space-y-3">
        {options.map((option) => {
          const count = votes[option.id] || 0;
          const percentage = getPercentage(count);
          const isSelected = userVote === option.id;
          const showResults = !!userVote;

          return (
            <button
              key={option.id}
              onClick={() => !showResults && handleVote(option.id)}
              disabled={showResults || loading}
              className={`relative w-full text-left group ${showResults ? 'cursor-default' : 'hover:bg-gray-100'}`}
            >
              {/* Progress Bar Background */}
              {showResults && (
                <div 
                  className={`absolute inset-0 rounded-lg transition-all duration-500 ${isSelected ? 'bg-blue-100' : 'bg-gray-200'}`}
                  style={{ width: `${percentage}%`, opacity: 0.5 }}
                />
              )}
              
              <div className={`relative flex items-center justify-between p-3 rounded-lg border transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50/50' 
                  : showResults 
                    ? 'border-transparent' 
                    : 'border-gray-200 bg-white hover:border-blue-300'
              }`}>
                <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                  {option.text}
                </span>
                
                {showResults && (
                  <span className="text-sm font-semibold text-gray-600">
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          <span>{totalVotes} votes</span>
          {!user && <span className="ml-2">• Log in to vote</span>}
        </div>

        {/* Voter Avatars */}
        {voterAvatars.length > 0 && (
          <div className="flex -space-x-2">
            {voterAvatars.map((url, i) => (
              <div key={i} className="relative w-6 h-6 rounded-full ring-2 ring-white overflow-hidden bg-gray-200">
                <img src={url} alt="Voter" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
