import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { ArrowRight, Ship, Box, Layers } from 'lucide-react';

interface PodsProps {
  onComplete: () => void;
}

export const Pods: React.FC<PodsProps> = ({ onComplete }) => {
  const [hasPod, setHasPod] = useState(false);

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h2 className="text-4xl font-bold text-white">The Atomic Unit: The Pod</h2>
        <p className="text-xl text-indigo-200 max-w-2xl">
          In Kubernetes, we don't run containers directly. We wrap them in a <strong>Pod</strong>.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-12 items-center my-12">
        <div className="space-y-6">
          <div className="bg-violet-900/20 p-6 rounded-xl border border-violet-500/30">
            <h3 className="text-xl font-bold text-violet-300 mb-2">Why a Pod?</h3>
            <p className="text-indigo-200">
              Think of a Pod as a "wrapper" or a "logical host". Usually, it's 1 Pod = 1 Container.
              But sometimes, you need a helper container (sidecar) to sit right next to the main one, sharing the same network and storage.
            </p>
          </div>

          <div className="bg-indigo-900/30 p-6 rounded-xl border border-indigo-800/50">
             <h4 className="font-mono text-sm text-indigo-400 uppercase tracking-wider mb-4">YAML Manifest</h4>
             <div className="font-mono text-sm space-y-1 text-fuchsia-300 bg-indigo-950/50 p-4 rounded-lg overflow-x-auto">
               <p><span className="text-violet-400">apiVersion:</span> v1</p>
               <p><span className="text-violet-400">kind:</span> Pod</p>
               <p><span className="text-violet-400">metadata:</span></p>
               <p className="pl-4"><span className="text-violet-400">name:</span> my-app</p>
               <p><span className="text-violet-400">spec:</span></p>
               <p className="pl-4"><span className="text-violet-400">containers:</span></p>
               <p className="pl-4">- <span className="text-violet-400">name:</span> web</p>
               <p className="pl-6"><span className="text-violet-400">image:</span> my-app:v1</p>
             </div>
             <div className="mt-4">
                <Button 
                  onClick={() => setHasPod(true)} 
                  className="w-full flex justify-center items-center gap-2"
                  disabled={hasPod}
                >
                  {hasPod ? 'Pod Created' : 'Apply Manifest'}
                </Button>
             </div>
          </div>
        </div>

        <div className="h-96 bg-indigo-950/50 rounded-2xl border border-indigo-800/50 flex items-center justify-center relative overflow-hidden">
           
           {/* The Container (Inside) */}
           <motion.div
             animate={hasPod ? { scale: 0.8 } : { scale: 1 }}
             className="bg-violet-600 w-32 h-32 rounded-lg flex flex-col items-center justify-center shadow-lg border-2 border-violet-400 relative z-10"
           >
             <Box size={48} className="text-white" />
             <span className="text-xs font-bold text-white mt-1">Container</span>
           </motion.div>

           {/* The Pod (Wrapper) */}
           <motion.div
             initial={{ opacity: 0, scale: 1.2, borderColor: "transparent" }}
             animate={hasPod ? { opacity: 1, scale: 1, borderColor: "rgb(232, 121, 249)" } : {}}
             className="absolute w-64 h-64 rounded-full border-4 border-dashed flex items-center justify-center z-0"
           >
             <div className="absolute -top-3 bg-indigo-950 px-2 text-fuchsia-400 font-bold flex items-center gap-2">
               <Ship size={16} /> Pod
             </div>
             <div className="absolute inset-0 bg-fuchsia-500/10 rounded-full blur-xl" />
           </motion.div>

           {/* Sidecar (Optional visual just to hint at it) */}
           {hasPod && (
             <motion.div
               initial={{ x: 100, opacity: 0 }}
               animate={{ x: 40, y: 40, opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="absolute bg-pink-600 w-16 h-16 rounded-lg flex items-center justify-center border-2 border-pink-400 shadow-lg z-20"
             >
                <Layers size={24} className="text-white" />
             </motion.div>
           )}
        </div>
      </div>

      {hasPod && (
         <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end pt-4"
        >
          <Button onClick={onComplete} className="flex items-center gap-2">
            Where do Pods live? (Nodes) <ArrowRight size={20} />
          </Button>
        </motion.div>
      )}
    </div>
  );
};
