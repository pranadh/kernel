import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiAward, FiRefreshCcw } from 'react-icons/fi';
import { ImStatsDots } from "react-icons/im";
import { TbKeyboard } from 'react-icons/tb';
import { useAuth } from '../context/AuthContext';
import { VscVerifiedFilled } from "react-icons/vsc";
import { useNavigate } from 'react-router-dom';
import ProfileHoverCard from '../components/ProfileHoverCard';
import axios from '../api';
import Toast from '../components/Toast';
import UsernameDisplay from '../components/UsernameDisplay';
import WpmHistoryChart from '../components/WpmHistoryChart';

const WORD_LIST = [
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

const TypingTest = () => {
    const { user } = useAuth();
    const WORDS_PER_LINE = 13;
    const VISIBLE_LINES = 4;
    const [userStats, setUserStats] = useState({
        bestRun: { wpm: 0, accuracy: 0 },
        avgWpm: 0,
        avgAccuracy: 0,
        testCount: 0,
        history: []
      });
    const [testState, setTestState] = useState({
        mode: '15', // time in seconds
        phase: 'waiting', // waiting, running, finished
        startTime: 0,
        timeLeft: 15,
        wordList: [],
        currentIndex: 0,
        currentWordIndex: 0,
        inputValue: '',
        correctChars: 0,
        incorrectChars: 0,
        rawWpm: 0,
        wpm: 0,
        accuracy: 100,
        currentLineIndex: 0,
    });

    const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
    const [testHistory, setTestHistory] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [selectedFont, setSelectedFont] = useState('font-mono');
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
    const inputRef = useRef(null);
    const wordListRef = useRef(null);
    const [hoveredAuthor, setHoveredAuthor] = useState(null);
    const [hoverAnchorEl, setHoverAnchorEl] = useState(null);
    const navigate = useNavigate();

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString(undefined, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getCharacterClass = useCallback((lineIdx, wordIdx, char, charIdx, currentInput) => {
        const isCurrentLine = lineIdx === 0; // First line should be active
        const isCurrentWord = wordIdx === testState.currentWordIndex % WORDS_PER_LINE;
        
        if (!isCurrentLine) return 'text-text-secondary';
        
        if (!isCurrentWord) {
            if (wordIdx < testState.currentWordIndex % WORDS_PER_LINE) {
                return 'text-text-secondary'; // Past words
            }
            return 'text-white'; // Future words
        }
        
        // Current word logic
        if (charIdx < currentInput.length) {
            return currentInput[charIdx] === char ? 'text-green-500' : 'text-red-500';
        }
        return charIdx === currentInput.length ? 'text-white border-l-2 border-primary' : 'text-white';
    }, [testState.currentWordIndex]);

    const generateWords = useCallback((count = 100) => {
        return Array.from({ length: count }, () => 
            WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
        );
    }, []);

    const getVisibleLines = useCallback(() => {
        const lines = [];
        const startLineIndex = testState.currentLineIndex;
        
        for (let i = 0; i < VISIBLE_LINES; i++) {
            const lineStartIndex = (startLineIndex + i) * WORDS_PER_LINE;
            const lineWords = testState.wordList.slice(lineStartIndex, lineStartIndex + WORDS_PER_LINE);
            if (lineWords.length > 0) {
                lines.push(lineWords);
            }
        }
        
        return lines;
    }, [testState.currentLineIndex, testState.wordList]);

    const resetTest = useCallback(() => {
        setTestState(prev => ({
            ...prev,
            phase: 'waiting',
            timeLeft: parseInt(prev.mode),
            wordList: generateWords(),
            currentIndex: 0,
            currentWordIndex: 0,
            inputValue: '',
            correctChars: 0,
            incorrectChars: 0,
            rawWpm: 0,
            wpm: 0,
            accuracy: 100,
            currentLineIndex: 0,
        }));
    }, [generateWords]);

    const calculateTestResults = useCallback(() => {
        const timeElapsed = (Date.now() - testState.startTime) / 1000;
        const minutes = timeElapsed / 60;
        const totalChars = testState.correctChars + testState.incorrectChars;
        const accuracy = (testState.correctChars / totalChars) * 100 || 0;
        const wpm = Math.round((testState.correctChars / 5) / minutes);

        return {
            wpm,
            accuracy: Math.round(accuracy),
            rawWpm: Math.round((totalChars / 5) / minutes)
        };
    }, [testState]);

    const fetchUserStats = useCallback(async () => {
        if (!user) return;
        
        try {
          const { data } = await axios.get(`/api/typing-scores/user-stats`, {
            params: { duration: testState.mode }
          });
          setUserStats(data);
        } catch (error) {
          setToast({
            show: true,
            message: 'Failed to load user stats',
            type: 'error'
          });
        }
    }, [testState.mode, user]);

    const handleInput = useCallback((e) => {
        const value = e.target.value;
        const lastChar = value[value.length - 1];
    
        if (testState.phase === 'waiting') {
            setTestState(prev => ({
                ...prev,
                phase: 'running',
                startTime: Date.now(),
                inputValue: value,
                timeLeft: parseInt(prev.mode)
            }));
            return;
        }
    
        if (testState.phase !== 'running') return;
    
        if (lastChar === ' ') {
            const currentWord = testState.wordList[testState.currentWordIndex];
            const inputWord = value.trim();
            
            let correctChars = 0;
            let incorrectChars = 0;
            
            for (let i = 0; i < Math.max(inputWord.length, currentWord.length); i++) {
                if (i < currentWord.length && i < inputWord.length && inputWord[i] === currentWord[i]) {
                    correctChars++;
                } else {
                    incorrectChars++;
                }
            }
    
            const nextWordIndex = testState.currentWordIndex + 1;
            const nextLineIndex = Math.floor(nextWordIndex / WORDS_PER_LINE);
    
            setTestState(prev => ({
                ...prev,
                currentWordIndex: nextWordIndex,
                currentLineIndex: nextLineIndex,
                inputValue: '',
                correctChars: prev.correctChars + correctChars,
                incorrectChars: prev.incorrectChars + incorrectChars,
            }));
        } else {
            setTestState(prev => ({
                ...prev,
                inputValue: value,
            }));
        }
    }, [testState.phase, testState.wordList, testState.currentWordIndex]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            resetTest();
        }
    }, [resetTest]);

    const getUniqueTopScores = (scores, limit = 10) => {
        const userBestScores = new Map();
        
        // Get best score for each user
        scores.forEach(score => {
            const userId = score.user._id;
            if (!userBestScores.has(userId) || userBestScores.get(userId).wpm < score.wpm) {
                userBestScores.set(userId, score);
            }
        });
      
        // Convert back to array, sort by WPM, and take top N scores
        return Array.from(userBestScores.values())
            .sort((a, b) => b.wpm - a.wpm)
            .slice(0, limit);
    };

      const fetchLeaderboard = useCallback(async () => {
        try {
            setIsLoadingLeaderboard(true);
            const { data } = await axios.get(`/api/typing-scores/leaderboard`, {
                params: { duration: testState.mode }
            });
            // Apply the unique scores filter
            const uniqueScores = getUniqueTopScores(data);
            console.log('Leaderboard scores:', uniqueScores);
            setLeaderboard(uniqueScores);
        } catch (error) {
            setToast({
                show: true,
                message: 'Failed to load leaderboard',
                type: 'error'
            });
        } finally {
            setIsLoadingLeaderboard(false);
        }
    }, [testState.mode]);

    const handleMouseEnter = (e, author) => {
        setHoverAnchorEl(e.currentTarget);
        setHoveredAuthor(author);
    };

    const handleMouseLeave = () => {
        setHoverAnchorEl(null);
        setHoveredAuthor(null);
    };

    const handleCardClick = (handle) => {
        navigate(`/u/${handle}`);
    };

    const padLeaderboard = (scores, totalSlots = 10) => {
        const paddedScores = [...scores];
        while (paddedScores.length < totalSlots) {
            paddedScores.push({
            _id: `empty-${paddedScores.length}`,
            wpm: '---',
            accuracy: '--',
            user: {
                username: 'Could be you!',
                handle: '',
                avatar: null
            }
            });
        }
        return paddedScores;
    };

    // Add leaderboard fetching
    useEffect(() => {
        fetchLeaderboard();
        fetchUserStats();
    }, [fetchLeaderboard, fetchUserStats]);

    // Timer effect
    useEffect(() => {
        let interval;
        
        if (testState.phase === 'running') {
            interval = setInterval(() => {
                const elapsedSeconds = Math.floor((Date.now() - testState.startTime) / 1000);
                const timeLeft = parseInt(testState.mode) - elapsedSeconds;
                
                setTestState(prev => {
                    const minutes = elapsedSeconds / 60;
                    const wpm = Math.round((prev.correctChars / 5) / minutes) || 0;
                    
                    if (timeLeft <= 0) {
                        const results = calculateTestResults();
                        return {
                            ...prev,
                            phase: 'finished',
                            timeLeft: 0,
                            wpm: results.wpm,
                            rawWpm: results.rawWpm,
                            accuracy: results.accuracy,
                        };
                    }
                    
                    return {
                        ...prev,
                        timeLeft,
                        wpm,
                    };
                });
            }, 100);
        }
        
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [testState.phase, testState.mode, testState.startTime, calculateTestResults]);

    // Save results when test finishes
    useEffect(() => {
        if (testState.phase === 'finished' && user) {
          const saveScore = async () => {
            try {
              await axios.post('/api/typing-scores', {
                wpm: testState.wpm,
                accuracy: testState.accuracy,
                duration: parseInt(testState.mode)
              });
              
              // Refresh both leaderboard and user stats
              await Promise.all([fetchLeaderboard(), fetchUserStats()]);
            } catch (error) {
              setToast({
                show: true,
                message: 'Failed to save score',
                type: 'error'
              });
            }
          };
      
          saveScore();
        }
      }, [testState.phase, testState.wpm, testState.accuracy, testState.mode, user, fetchLeaderboard, fetchUserStats]);

    // Initialize test
    useEffect(() => {
        resetTest();
    }, [resetTest]);

    return (
        <div className="min-h-screen bg-[#101113] text-white">
            {/* Upper section with fixed width */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Test Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <TbKeyboard className="w-8 h-8 text-primary" />
                            <div>
                                <h1 className="text-3xl font-bold text-white">Typing Test</h1>
                                <p className="text-text-secondary">Run a 15, 30 or 60 second typing test</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <select
                                value={selectedFont}
                                onChange={(e) => setSelectedFont(e.target.value)}
                                className="bg-surface-2 text-text-secondary hover:text-white px-3 py-2 rounded 
                                        border border-white/5 focus:outline-none focus:ring-1 focus:ring-primary
                                        transition-colors cursor-pointer"
                            >
                                <option value="font-mono">Monospace</option>
                                <option value="font-sans">Sans Serif</option>
                                <option value="font-serif">Serif</option>
                            </select>
                            <button
                                onClick={resetTest}
                                className="p-2 text-text-secondary hover:text-white transition-colors"
                                title="Reset test (Tab)"
                            >
                                <FiRefreshCcw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
    
                    {/* Test Area */}
                    <div 
                        className="relative mb-8 p-8 bg-surface-1 rounded-lg"
                        onClick={() => inputRef.current?.focus()}
                    >
                        {/* Words Display */}
                        <div 
                            ref={wordListRef}
                            className={`h-[160px] text-2xl ${selectedFont} mb-8 flex flex-col gap-2 transition-all duration-200`}
                        >
                            {getVisibleLines().map((lineWords, lineIdx) => (
                                <div 
                                    key={`line-${testState.currentLineIndex + lineIdx}`}
                                    className={`transition-all duration-200 ${
                                        lineIdx === 0 ? 'opacity-100' : 'opacity-50'
                                    }`}
                                >
                                    {lineWords.map((word, wordIdx) => (
                                        <span key={`${word}-${wordIdx}`} className="mr-2">
                                            {word.split('').map((char, charIdx) => (
                                                <span
                                                    key={charIdx}
                                                    className={getCharacterClass(
                                                        lineIdx,
                                                        wordIdx,
                                                        char,
                                                        charIdx,
                                                        lineIdx === 0 && wordIdx === testState.currentWordIndex % WORDS_PER_LINE 
                                                            ? testState.inputValue 
                                                            : ''
                                                    )}
                                                >
                                                    {char}
                                                </span>
                                            ))}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
    
                        {/* Input */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={testState.inputValue}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            className="absolute opacity-0"
                            autoFocus
                        />
    
                        {/* Test Info */}
                        <div className="flex items-center justify-between text-sm text-text-secondary">
                            <div>{testState.timeLeft}s</div>
                            <div className="flex gap-4">
                                <div>{testState.wpm} wpm</div>
                                {testState.phase === 'finished' && (
                                    <div>{testState.accuracy}% acc</div>
                                )}
                            </div>
                        </div>
                    </div>
    
                    {/* Mode Selection */}
                    <div className="flex gap-2 mb-8">
                        {['15', '30', '60'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => {
                                    setTestState(prev => ({
                                        ...prev,
                                        mode,
                                        timeLeft: parseInt(mode)
                                    }));
                                    resetTest();
                                }}
                                className={`px-4 py-2 rounded ${
                                    testState.mode === mode
                                        ? 'bg-primary text-white'
                                        : 'bg-surface-2 text-text-secondary hover:text-white'
                                }`}
                            >
                                {mode}s
                            </button>
                        ))}
                    </div>
                </div>
            </div>
    
            {/* Full width stats and leaderboard section */}
            <div className="w-full bg-surface-2/20 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 gap-8">
                    {/* User Stats */}
                    <div className="bg-surface-1 rounded-lg border border-white/5 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <ImStatsDots className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-semibold text-white">Your Stats</h2>
                            </div>
                            <div className="px-3 py-1 bg-surface-2 rounded-full text-sm text-text-secondary">
                                {testState.mode}s tests
                            </div>
                        </div>

                        <div className="space-y-4">
                            {user ? (
                                <>
                                    <div className="bg-surface-2 p-4 rounded-lg">
                                        <div className="text-sm text-text-secondary">Best WPM</div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="text-2xl font-bold text-white">{userStats.bestRun.wpm}</div>
                                                <div className="text-sm text-text-secondary">WPM</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-xs text-text-secondary">
                                                    {userStats.bestRun.createdAt && formatDateTime(userStats.bestRun.createdAt)}
                                                </div>
                                                {leaderboard.length > 0 && (
                                                    <div className="px-3 py-1 bg-primary/10 rounded-full">
                                                        <span className="text-sm font-semibold text-white">
                                                            #{leaderboard.filter(score => score.wpm > userStats.bestRun.wpm).length + 1}
                                                        </span>
                                                        <span className="text-xs text-text-secondary ml-1">
                                                            on leaderboard
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <div className="text-sm text-text-secondary">
                                                with <span className="text-white">{userStats.bestRun.accuracy}%</span> accuracy
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-surface-2 p-4 rounded-lg">
                                            <div className="text-sm text-text-secondary">Avg WPM</div>
                                            <div className="text-xl font-bold text-white">{userStats.avgWpm}</div>
                                        </div>
                                        <div className="bg-surface-2 p-4 rounded-lg">
                                            <div className="text-sm text-text-secondary">Avg Accuracy</div>
                                            <div className="text-xl font-bold text-white">{userStats.avgAccuracy}%</div>
                                        </div>
                                        <div className="bg-surface-2 p-4 rounded-lg">
                                            <div className="text-sm text-text-secondary">Tests</div>
                                            <div className="text-xl font-bold text-white">{userStats.testCount}</div>
                                        </div>
                                    </div>
                                    {userStats.history?.length > 0 && (
                                        <WpmHistoryChart testHistory={userStats.history} />
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 text-text-secondary">
                                    Sign in to track your progress
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Updated Leaderboard */}
                    <div className="bg-surface-1 rounded-lg border border-white/5 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <FiAward className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-semibold text-white">Leaderboard</h2>
                            </div>
                            <div className="px-3 py-1 bg-surface-2 rounded-full text-sm text-text-secondary">
                                {testState.mode}s top scores
                            </div>
                        </div>
                        <div className="space-y-4">
                        {isLoadingLeaderboard ? (
                            <div className="text-center py-8 text-text-secondary animate-pulse">
                                Loading leaderboard...
                            </div>
                        ) : (
                            padLeaderboard(leaderboard).map((score, index) => (
                                <div
                                    key={score._id}
                                    onClick={() => score.user.handle && handleCardClick(score.user.handle)}
                                    className={`flex items-center justify-between p-4 bg-surface-2 rounded-lg 
                                            ${score.user.handle ? 'hover:bg-surface-2/80 cursor-pointer' : 'opacity-50'} 
                                            transition-colors`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-bold text-primary">
                                            {index === 0 ? '🥇' : 
                                            index === 1 ? '🥈' : 
                                            index === 2 ? '🥉' : 
                                            `#${index + 1}`}
                                        </span>

                                        {/* Avatar Section */}
                                        <div 
                                            className="relative flex-shrink-0"
                                            onMouseEnter={(e) => score.user.handle && handleMouseEnter(e, score.user)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/5">
                                                {score.user.avatar ? (
                                                    <img 
                                                        src={score.user.avatar}
                                                        alt={score.user.username}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                                                        <span className="text-lg font-semibold text-text-primary opacity-50">
                                                            {score.user.username ? score.user.username.charAt(0).toUpperCase() : '?'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                {score.user.handle ? (
                                                    <>
                                                        <UsernameDisplay 
                                                            user={score.user}
                                                            className="font-medium text-white"
                                                        />
                                                        {score.user.isVerified && (
                                                            <VscVerifiedFilled className="w-4 h-4 text-primary" />
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="font-medium text-white opacity-75">
                                                        {score.user.username}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm text-text-secondary font-medium">
                                                    {score.wpm} WPM
                                                </div>
                                                <span className="text-xs text-text-secondary opacity-50">•</span>
                                                <div className="text-sm text-text-secondary">
                                                    {score.accuracy}% accuracy
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {!score.user.handle && (
                                        <div className="text-xs text-text-secondary italic">
                                            Take the test to compete!
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Toast Component */}
        {toast.show && (
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ show: false, message: '', type: 'error' })}
            />
        )}
        {hoveredAuthor && hoverAnchorEl && (
        <ProfileHoverCard 
            author={hoveredAuthor}
            anchorEl={hoverAnchorEl}
        />
        )}
    </div>
    );
};

export default TypingTest;