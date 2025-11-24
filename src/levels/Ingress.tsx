import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { Globe, DoorOpen, Radio, CheckCircle } from 'lucide-react';

interface IngressProps {
  onComplete: () => void;
}

export const Ingress: React.FC<IngressProps> = ({ onComplete }) => {
  const [activePath, setActivePath] = useState<'/web' | '/api' | null>(null);

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h2 className="text-4xl font-bold text-white">The Gateway: Ingress</h2>
        <p className="text-xl text-indigo-200 max-w-2xl">
          Services are great, but they are usually internal. To let the outside world in, 
          we need an <strong>Ingress</strong>.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-12 items-center my-12">
        <div className="space-y-6">
          <div className="bg-indigo-900/30 p-6 rounded-xl border border-indigo-800/50">
            <h3 className="text-xl font-bold text-white mb-4">Routing Rules</h3>
            <p className="text-indigo-200 mb-4">
              Ingress acts like a smart router or receptionist. It looks at the URL and decides where to go.
            </p>
            <ul className="space-y-2 font-mono text-sm text-fuchsia-300 bg-indigo-950/50 p-4 rounded mb-6">
                <li>/web ➜ Web Service</li>
                <li>/api ➜ API Service</li>
            </ul>
            
            <div className="flex gap-4">
                <Button 
                    onClick={() => setActivePath('/web')} 
                    variant={activePath === '/web' ? 'primary' : 'outline'}
                    className="flex-1"
                >
                    Visit /web
                </Button>
                <Button 
                    onClick={() => setActivePath('/api')} 
                    variant={activePath === '/api' ? 'primary' : 'outline'}
                    className="flex-1"
                >
                    Visit /api
                </Button>
            </div>
          </div>
        </div>

        <div className="relative bg-indigo-950/50 rounded-2xl border border-indigo-800/50 p-8 min-h-[400px] flex flex-col items-center justify-between">
           
           {/* Internet */}
           <div className="flex flex-col items-center gap-2 z-10">
               <Globe size={48} className="text-violet-400 animate-pulse" />
               <span className="text-sm font-bold text-violet-300">The Internet</span>
           </div>

           {/* Traffic Particle */}
           <AnimatePresence mode="wait">
               {activePath && (
                   <motion.div
                        key={activePath}
                        initial={{ top: 60, opacity: 0 }}
                        animate={{ 
                            top: [60, 150, 300],
                            x: [0, 0, activePath === '/web' ? -80 : 80],
                            opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 1.5 }}
                        className="absolute w-6 h-6 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.9)] z-20 flex items-center justify-center text-[8px] text-black font-bold"
                   >
                       {activePath}
                   </motion.div>
               )}
           </AnimatePresence>

           {/* Ingress Controller */}
           <div className="w-48 bg-fuchsia-600/20 border-2 border-fuchsia-500 rounded-xl p-4 flex flex-col items-center gap-2 relative z-10">
               <DoorOpen size={32} className="text-fuchsia-400" />
               <span className="font-bold text-fuchsia-100">Ingress</span>
           </div>

           {/* Services */}
           <div className="flex justify-between w-full max-w-xs z-10">
               <motion.div 
                 animate={activePath === '/web' ? { scale: 1.1, borderColor: 'rgb(139, 92, 246)' } : { scale: 1, borderColor: 'rgba(139, 92, 246, 0.5)' }}
                 className="bg-indigo-900 border-2 border-violet-500/50 p-4 rounded-lg flex flex-col items-center w-32 transition-colors"
               >
                   <Radio size={24} className="text-violet-400 mb-2" />
                   <span className="text-xs font-bold text-white">Web Service</span>
               </motion.div>

               <motion.div 
                 animate={activePath === '/api' ? { scale: 1.1, borderColor: 'rgb(139, 92, 246)' } : { scale: 1, borderColor: 'rgba(139, 92, 246, 0.5)' }}
                 className="bg-indigo-900 border-2 border-violet-500/50 p-4 rounded-lg flex flex-col items-center w-32 transition-colors"
               >
                   <Radio size={24} className="text-violet-400 mb-2" />
                   <span className="text-xs font-bold text-white">API Service</span>
               </motion.div>
           </div>

        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-violet-900/40 to-fuchsia-900/40 p-8 rounded-2xl border border-violet-500/30 text-center"
      >
          <div className="w-16 h-16 bg-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-fuchsia-500/20">
              <CheckCircle size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Journey Complete!</h2>
          <p className="text-lg text-indigo-200 mb-8 max-w-2xl mx-auto">
              You've mastered the basics: Containers, Pods, Nodes, ReplicaSets, Services, and Ingress.
              You are now ready to sail the seas of Kubernetes!
          </p>
          
          <Button onClick={onComplete} className="bg-white text-violet-900 hover:bg-indigo-100">
              Restart Adventure
          </Button>
      </motion.div>
    </div>
  );
};
