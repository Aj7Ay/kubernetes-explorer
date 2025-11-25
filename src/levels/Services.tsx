import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { ArrowRight, Radio, Share2, User, Ship } from 'lucide-react';

interface ServicesProps {
  onComplete: () => void;
}

export const Services: React.FC<ServicesProps> = ({ onComplete }) => {
  const [requests, setRequests] = useState<{id: number, targetPod: number}[]>([]);
  const [reqId, setReqId] = useState(0);

  const sendRequest = () => {
    const newReqId = reqId + 1;
    setReqId(newReqId);
    // Randomly assign to pod 1, 2, or 3
    const target = Math.floor(Math.random() * 3) + 1;
    setRequests(prev => [...prev, { id: newReqId, targetPod: target }]);
    
    // Cleanup request after animation
    setTimeout(() => {
        setRequests(prev => prev.filter(r => r.id !== newReqId));
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h2 className="text-4xl font-bold text-white">The Radio: Services</h2>
        <p className="text-xl text-indigo-200 max-w-2xl">
          Pods are ephemeral (they die). Their IP addresses change. 
          How do we talk to them reliably? We use a <strong>Service</strong>.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-12 items-center my-12">
        <div className="space-y-6">
          <div className="bg-indigo-900/30 p-6 rounded-xl border border-indigo-800/50">
            <h3 className="text-xl font-bold text-white mb-4">Stable Address</h3>
            <p className="text-indigo-200 mb-4">
              A Service gives you a single, stable IP address and DNS name (e.g., <code>my-app.svc</code>).
              It doesn't matter if the Pods behind it change.
            </p>
            <p className="text-indigo-200 mb-6">
              It acts as an internal Load Balancer, distributing traffic to all matching Pods.
            </p>
            
            <Button 
                onClick={sendRequest} 
                className="w-full flex justify-center items-center gap-2 py-4"
            >
                Send Request <Share2 size={18} />
            </Button>
          </div>
          
          <div className="bg-fuchsia-900/20 p-4 rounded-lg border border-fuchsia-500/30">
             <h4 className="font-bold text-fuchsia-300 mb-2">Selector Magic</h4>
             <p className="text-sm text-fuchsia-200">
                 The Service finds Pods using <strong>Labels</strong>. It says "Send traffic to anything with <code>app=web</code>".
             </p>
          </div>
        </div>

        <div className="relative bg-indigo-950/50 rounded-2xl border border-indigo-800/50 p-8 min-h-[400px] flex flex-col items-center justify-center gap-12">
           
           {/* Client */}
           <div className="flex flex-col items-center gap-2 z-10">
               <div className="w-16 h-16 bg-indigo-800 rounded-full flex items-center justify-center border-2 border-indigo-600">
                   <User size={32} className="text-indigo-300" />
               </div>
               <span className="text-xs text-indigo-400">Other App / User</span>
           </div>

           {/* Service Layer */}
           <div className="w-full max-w-xs bg-fuchsia-600/20 border-2 border-fuchsia-500 rounded-xl p-4 flex items-center justify-between relative z-10">
               <div className="flex items-center gap-3">
                   <Radio size={24} className="text-fuchsia-400" />
                   <div>
                       <span className="block font-bold text-fuchsia-100 text-sm">Service IP</span>
                       <span className="block font-mono text-[10px] text-fuchsia-300">10.96.0.1</span>
                   </div>
               </div>
               <div className="bg-fuchsia-500 text-white text-[10px] px-2 py-1 rounded font-mono">
                   app=web
               </div>
           </div>

           {/* Pods Layer */}
           <div className="grid grid-cols-3 gap-4 w-full z-10">
               {[1, 2, 3].map(i => (
                   <div key={i} className="bg-violet-600/20 border border-violet-500/50 rounded-lg p-3 flex flex-col items-center gap-2 relative">
                       <Ship size={24} className="text-violet-400" />
                       <span className="text-[10px] text-violet-300 font-mono">pod-{i}</span>
                       
                       {/* Selector Match Indicator */}
                       <div className="absolute -top-2 -right-2 bg-fuchsia-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                           app=web
                       </div>
                   </div>
               ))}
           </div>

           {/* Request Particles */}
           <AnimatePresence>
               {requests.map(r => {
                   const targetLeft = `${(r.targetPod * 33) - 16}%`;
                   return (
                       <motion.div
                           key={r.id}
                           initial={{ top: 60, left: '50%', scale: 0 }}
                           animate={{
                               top: [60, 160, 280],
                               left: ['50%', '50%', targetLeft],
                               scale: [1, 1, 0.5],
                               opacity: [1, 1, 0]
                           }}
                           transition={{ duration: 1, times: [0, 0.4, 1] }}
                           className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] z-20"
                       />
                   );
               })}
           </AnimatePresence>

        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onComplete} className="flex items-center gap-2">
          Open the Port (Ingress) <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
};
