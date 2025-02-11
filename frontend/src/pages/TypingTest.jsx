import React, { useState, useEffect, useRef } from 'react';
import { FiAward } from 'react-icons/fi';
import { TbKeyboard } from 'react-icons/tb';
import { useAuth } from '../context/AuthContext';
import axios from '../api';
import Toast from '../components/Toast';

const commonWords = [
  'the', 'be', 'to', 'of', 'and', 'that', 'have', 'with', 'you', 'this',
  'from', 'they', 'say', 'her', 'she', 'will', 'one', 'all', 'would', 'there',
  'their', 'what', 'out', 'about', 'who', 'get', 'which', 'when', 'make',
  'can', 'like', 'time', 'think', 'see', 'know', 'just', 'him', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well',
  'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day',
  'most', 'us', 'time', 'person', 'year', 'group', 'life', 'world', 'hand',
  'part', 'child', 'eye', 'woman', 'place', 'case', 'point', 'face', 'number'
];

// Replace the generateWord function with this:
const generateWord = () => {
  return commonWords[Math.floor(Math.random() * commonWords.length)];
};

const TypingTest = () => {
  const { user } = useAuth();
  const [time, setTime] = useState(30);
  const [timeLeft, setTimeLeft] = useState(time);
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedWords, setTypedWords] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [typed, setTyped] = useState('');
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const inputRef = useRef(null);

  const generateInitialWords = () => {
    return Array.from({ length: 15 }, () => generateWord());
  };

  const addMoreWords = () => {
    setWords(prev => [...prev, ...Array.from({ length: 5 }, () => generateWord())]);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await axios.get('/api/typing-scores');
      setLeaderboard(data);
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to fetch leaderboard',
        type: 'error'
      });
    }
  };

  const handleInput = (e) => {
    const value = e.target.value;
    
    // Start timer on first keystroke
    if (!hasStarted && value) {
      setHasStarted(true);
      setIsRunning(true);
    }
    
    if (value.endsWith(' ')) {
      const word = value.trim();
      if (word) {
        setTypedWords(prev => [...prev, word]);
        setTyped('');
        setCurrentWordIndex(prev => prev + 1);

        if (currentWordIndex > words.length - 8) {
          addMoreWords();
        }
      }
    } else {
      setTyped(value);
    }
  };

  const startTest = () => {
    const initialWords = generateInitialWords();
    setWords(initialWords);
    setTypedWords([]);
    setCurrentWordIndex(0);
    setTyped('');
    setTimeLeft(time);
    setHasStarted(false);
    setIsRunning(false);
    setWpm(0);
    setAccuracy(0);
    if (inputRef.current) inputRef.current.focus();
  };

  const calculateScore = () => {
    const totalWords = typedWords.length;
    const correctWords = typedWords.filter(
      (word, i) => word === words[i]
    ).length;
    
    const wpm = Math.round((totalWords / time) * 60);
    const acc = Math.round((correctWords / totalWords) * 100) || 0;
    
    setWpm(wpm);
    setAccuracy(acc);

    return { wpm, accuracy: acc };
  };

  const saveScore = async (score) => {
    try {
      await axios.post('/api/typing-scores', {
        wpm: score.wpm,
        accuracy: score.accuracy,
        duration: time
      });
      fetchLeaderboard();
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to save score',
        type: 'error'
      });
    }
  };

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      const score = calculateScore();
      if (user) saveScore(score);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  return (
    <div className="min-h-screen bg-[#101113]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <TbKeyboard className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-white">Typing Test</h1>
              <p className="text-text-secondary">Test your typing speed</p>
            </div>
          </div>

          {/* Duration Selection */}
          <div className="flex gap-2 mb-6">
            {[15, 30, 60].map(duration => (
              <button
                key={duration}
                onClick={() => setTime(duration)}
                disabled={isRunning}
                className={`px-4 py-2 rounded-md transition-colors ${
                  time === duration 
                    ? 'bg-primary text-white' 
                    : 'bg-surface-2 text-text-secondary hover:text-white'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {duration}s
              </button>
            ))}
          </div>

          {/* Test Area */}
          <div className="bg-surface-1 rounded-lg border border-white/5 p-6 mb-8">
            {words.length > 0 ? (
                <>
                <div className="mb-4 text-center">
                    {hasStarted ? (
                    <span className="text-2xl font-bold text-primary">{timeLeft}s</span>
                    ) : (
                    <span className="text-lg text-text-secondary">Start typing to begin test...</span>
                    )}
                </div>
                <div className="mb-4 text-lg leading-relaxed">
                    {words.slice(currentWordIndex, currentWordIndex + 8).map((word, i) => (
                    <span 
                        key={currentWordIndex + i}
                        className={`mr-3 ${
                        i === 0 
                            ? typed === word
                            ? 'text-green-500'
                            : typed && !word.startsWith(typed)
                                ? 'text-red-500'
                                : 'text-primary'
                            : 'text-text-secondary'
                        }`}
                    >
                        {word}
                    </span>
                    ))}
                </div>
                <input
                    ref={inputRef}
                    value={typed}
                    onChange={handleInput}
                    className="w-full p-4 bg-surface-2 rounded border border-white/5 
                            text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50
                            text-lg"
                    placeholder="Type to start..."
                    autoFocus
                />
                </>
            ) : (
                <div className="text-center py-8">
                <button
                    onClick={startTest}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-white 
                            rounded-md transition-colors"
                >
                    New {time}s Test
                </button>
                </div>
            )}
            </div>

          {/* Results */}
          {!isRunning && wpm > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-surface-2 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-primary">{wpm}</div>
                <div className="text-text-secondary">Words per minute</div>
              </div>
              <div className="bg-surface-2 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-primary">{accuracy}%</div>
                <div className="text-text-secondary">Accuracy</div>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="bg-surface-1 rounded-lg border border-white/5 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FiAward className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-white">Leaderboard</h2>
            </div>
            <div className="space-y-4">
              {leaderboard.map((score, index) => (
                <div 
                  key={score._id}
                  className="flex items-center justify-between p-4 bg-surface-2 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-primary">#{index + 1}</span>
                    <div>
                      <div className="font-medium text-white">{score.user.username}</div>
                      <div className="text-sm text-text-secondary">{score.wpm} WPM</div>
                    </div>
                  </div>
                  <div className="text-text-secondary">{score.accuracy}% accuracy</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'error' })}
        />
      )}
    </div>
  );
};

export default TypingTest;