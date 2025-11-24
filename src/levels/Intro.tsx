import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { ArrowRight, ArrowLeft, AlertOctagon, X, Server, Laptop, Activity } from 'lucide-react';

interface IntroProps {
  onComplete: () => void;
}

// Terminal typing animation hook
const useTypingAnimation = (text: string, speed: number = 100, shouldStart: boolean = true) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text || !shouldStart) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }
    
    setIsTyping(true);
    setDisplayedText('');
    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, speed);

    return () => clearInterval(typeInterval);
  }, [text, speed, shouldStart]);

  return { displayedText, isTyping };
};

export const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [scene, setScene] = useState(-1); // Start at -1 for intro animation
  const [isCrashing, setIsCrashing] = useState(false);
  const [crashedService, setCrashedService] = useState<string | null>(null);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);
  
  const titleText = "Mr Cloud Book";
  const subtitleText = "Kubernetes for All";
  
  const { displayedText: displayedTitle, isTyping: isTypingTitle } = useTypingAnimation(
    titleText,
    80,
    scene === -1
  );
  const { displayedText: displayedSubtitle, isTyping: isTypingSubtitle } = useTypingAnimation(
    subtitleText,
    60,
    showSubtitle
  );

  const handleDisaster = () => {
      setIsCrashing(true);
      setTimeout(() => {
          setIsCrashing(false);
          setScene(prev => prev + 1);
      }, 1000);
  };

  const nextScene = () => setScene(prev => prev + 1);
  const prevScene = () => setScene(prev => Math.max(0, prev - 1));

  const killService = () => {
    const services = ['Auth', 'Cart', 'Payment', 'Profile', 'Search'];
    const random = services[Math.floor(Math.random() * services.length)];
    setCrashedService(random);
  };

  // Handle intro animation sequence
  useEffect(() => {
    if (scene === -1) {
      // Show "One For all" after title finishes typing
      const titleDelay = titleText.length * 80 + 500;
      setTimeout(() => {
        setShowSubtitle(true);
      }, titleDelay);
      
      // Show "Let's begin" button after subtitle finishes typing
      const subtitleDelay = titleDelay + subtitleText.length * 60 + 500;
      setTimeout(() => {
        setShowButton(true);
      }, subtitleDelay);
    }
  }, [scene]);
  
  const handleBegin = () => {
    setScene(0);
    setShowSubtitle(false);
    setShowButton(false);
  };

  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center text-center space-y-8 font-sans max-w-5xl mx-auto">
      
      {/* Scene -1: Animated Intro */}
      {scene === -1 && (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] w-full">
          <div className="flex flex-col items-center justify-center space-y-8">
            {/* MR CLOUD BOOK Title with Typing Animation - Reserve space */}
            <div className="w-full flex justify-center min-h-[120px] items-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <h1 className="text-7xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400" style={{ fontFamily: 'Satoshi, system-ui, -apple-system, sans-serif' }}>
                  {displayedTitle}
                  {isTypingTitle && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-1 h-20 bg-fuchsia-400 ml-2"
                    />
                  )}
                </h1>
              </motion.div>
            </div>

            {/* One For all Subtitle with Typing Animation - Reserve space */}
            <div className="w-full flex justify-center min-h-[60px] items-center">
              {showSubtitle ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                  style={{ fontFamily: 'Satoshi, system-ui, -apple-system, sans-serif' }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                    {displayedSubtitle}
                    {isTypingSubtitle && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-0.5 h-8 bg-purple-300 ml-1"
                      />
                    )}
                  </h2>
                </motion.div>
              ) : (
                <div className="h-[60px]"></div>
              )}
            </div>

            {/* Let's Begin Button - Reserve space */}
            <div className="w-full flex justify-center min-h-[60px] items-center">
              {showButton ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Button 
                    onClick={handleBegin}
                    className="text-lg px-8 py-4 flex items-center justify-center gap-2 mx-auto"
                    style={{ fontFamily: 'Satoshi, system-ui, -apple-system, sans-serif' }}
                  >
                    Let's Begin <ArrowRight />
                  </Button>
                </motion.div>
              ) : (
                <div className="h-[60px]"></div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Scene 0: The Monolith Era */}
      {scene === 0 && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
        >
            <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">
                Chapter 1: The Era of Giants
            </h2>
            <p className="text-xl text-indigo-200 max-w-2xl mx-auto leading-relaxed">
                Long ago, we built software as <strong>Monoliths</strong>. 
                One giant code-base. One giant database. One giant server.
            </p>
            
            <div className="relative h-64 w-64 mx-auto bg-indigo-950 rounded-3xl border-4 border-violet-500 shadow-[0_0_50px_rgba(139,92,246,0.3)] flex items-center justify-center overflow-hidden">
                <AnimatePresence>
                    {!isCrashing ? (
                        <motion.div 
                            key="monolith"
                            className="relative z-10 flex flex-col items-center"
                            exit={{ scale: 0, opacity: 0, rotate: 720 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="flex gap-2 mb-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse delay-75" />
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse delay-150" />
                            </div>
                            <Server size={80} className="text-violet-200" />
                            <span className="mt-4 font-bold text-violet-300 tracking-widest uppercase">Monolith v1.0</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="explosion"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1.5, rotate: 180 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <AlertOctagon size={100} className="text-red-500" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <Button onClick={handleDisaster} className="text-lg px-8 py-4 flex items-center justify-center gap-2 mx-auto">
                But then, disaster struck... <ArrowRight />
            </Button>
        </motion.div>
      )}

      {/* Scene 1: The Crash */}
      {scene === 1 && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <h2 className="text-4xl font-bold text-red-400">The Problem with Giants</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center text-left">
                <div className="bg-red-900/20 p-8 rounded-2xl border border-red-500/30">
                    <div className="flex items-center gap-4 mb-6 text-red-300">
                        <AlertOctagon size={32} />
                        <h3 className="text-2xl font-bold">One Tiny Bug...</h3>
                    </div>
                    <p className="text-indigo-200 text-lg mb-6">
                        A developer made a typo in the "User Profile" code. 
                        Just a small error. But because everything is connected...
                    </p>
                    <ul className="space-y-3 text-red-200">
                        <li className="flex items-center gap-2"><X size={18} /> Checkout stopped working</li>
                        <li className="flex items-center gap-2"><X size={18} /> Login stopped working</li>
                        <li className="flex items-center gap-2"><X size={18} /> The entire server crashed</li>
                    </ul>
                </div>

                <div className="h-64 w-64 mx-auto relative">
                     <motion.div 
                        animate={{ rotate: [-2, 2, -2, 2, 0], x: [-5, 5, -5, 5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        className="w-full h-full bg-red-500/20 rounded-3xl border-4 border-red-500 flex items-center justify-center"
                     >
                         <span className="text-6xl font-bold text-red-500">ERROR</span>
                     </motion.div>
                </div>
            </div>
            <div className="flex justify-center gap-4">
                <Button onClick={prevScene} variant="outline" className="flex items-center gap-2">
                    <ArrowLeft size={20} /> Back
                </Button>
                <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                    We need a better way... <ArrowRight />
                </Button>
            </div>
        </motion.div>
      )}

      {/* Scene 2: Microservices */}
      {scene === 2 && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
             <h2 className="text-4xl font-bold text-white">Chapter 2: Microservices</h2>
             <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
                We decided to break the Giant into pieces. Small, independent services.
                If the "Profile" service breaks, the "Checkout" service keeps running!
            </p>

            <div className="flex flex-wrap justify-center gap-8 my-8">
                {['Auth', 'Cart', 'Payment', 'Profile', 'Search'].map((name, i) => {
                    const isDown = crashedService === name;
                    return (
                    <motion.div
                        key={name}
                        initial={{ scale: 0 }}
                        animate={{ 
                            scale: 1,
                            borderColor: isDown ? 'rgba(239, 68, 68, 1)' : 'rgba(139, 92, 246, 1)',
                            backgroundColor: isDown ? 'rgba(127, 29, 29, 0.5)' : 'rgba(55, 48, 163, 1)'
                        }}
                        transition={{ delay: i * 0.1 }}
                        className="w-32 h-32 rounded-xl border-2 flex flex-col items-center justify-center shadow-lg relative overflow-hidden"
                    >
                        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${isDown ? 'bg-red-500' : 'bg-green-400 animate-pulse'}`} />
                        
                        {isDown ? (
                            <X className="text-red-400 mb-2" size={32} />
                        ) : (
                            <Server className="text-violet-300 mb-2" size={24} />
                        )}
                        
                        <span className={`text-sm font-bold ${isDown ? 'text-red-200' : 'text-white'}`}>{name}</span>
                        
                        {!isDown && (
                            <motion.div 
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute bottom-2 flex items-center gap-1 text-xs text-green-300"
                            >
                                <Activity size={10} /> Active
                            </motion.div>
                        )}
                    </motion.div>
                )})}
            </div>

            <div className="flex justify-center gap-4">
                <Button onClick={killService} variant="secondary" className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
                    <AlertOctagon size={18} /> Simulate Service Crash
                </Button>
            </div>

            <div className="bg-black/30 p-4 rounded-lg max-w-xl mx-auto min-h-[60px] flex items-center justify-center">
                {crashedService ? (
                    <p className="text-green-300 font-mono">
                        <span className="text-red-400 font-bold">CRITICAL ALERT:</span> {crashedService} Service is DOWN! 
                        <br/>
                        But look! Others are still serving traffic! ✅
                    </p>
                ) : (
                    <p className="text-indigo-300 font-mono">System Status: All Systems Operational</p>
                )}
            </div>

            <div className="flex justify-center gap-4 pt-4">
                <Button onClick={prevScene} variant="outline" className="flex items-center gap-2">
                    <ArrowLeft size={20} /> Back
                </Button>
                <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                    But now we have a NEW problem... <ArrowRight />
                </Button>
            </div>
        </motion.div>
      )}

      {/* Scene 3: Dependency Hell */}
      {scene === 3 && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
             <h2 className="text-4xl font-bold text-white">The "Works on My Machine" Curse</h2>
             
             <div className="grid md:grid-cols-2 gap-16 items-center">
                 <div className="text-center space-y-4">
                     <Laptop size={64} className="mx-auto text-blue-400" />
                     <h3 className="text-2xl font-bold text-blue-300">Developer's Laptop</h3>
                     <div className="bg-blue-900/30 p-4 rounded-lg text-left font-mono text-sm text-blue-200 space-y-2">
                         <p>OS: MacOS</p>
                         <p>Node: v18.0.0</p>
                         <p>Python: v3.9</p>
                         <p className="text-green-400 font-bold">STATUS: WORKING ✅</p>
                     </div>
                 </div>

                 <div className="text-center space-y-4">
                     <Server size={64} className="mx-auto text-red-400" />
                     <h3 className="text-2xl font-bold text-red-300">Production Server</h3>
                     <div className="bg-red-900/30 p-4 rounded-lg text-left font-mono text-sm text-red-200 space-y-2">
                         <p>OS: Ubuntu Linux</p>
                         <p>Node: v14.0.0 (OLD!)</p>
                         <p>Python: v2.7 (OLD!)</p>
                         <p className="text-red-400 font-bold">STATUS: CRASHED ❌</p>
                     </div>
                 </div>
             </div>

             <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
                 The environments are different! Libraries are missing. Versions are wrong.
                 It's a nightmare to keep track of requirements for 100 different services.
             </p>

            <div className="flex justify-center gap-4">
                <Button onClick={prevScene} variant="outline" className="flex items-center gap-2">
                    <ArrowLeft size={20} /> Back
                </Button>
                <Button onClick={onComplete} className="text-lg px-8 py-4 flex items-center justify-center gap-2 whitespace-nowrap">
                    Enter the Hero: Docker <ArrowRight />
                </Button>
            </div>
        </motion.div>
      )}

    </div>
  );
};
