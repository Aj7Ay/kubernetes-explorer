import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { ArrowRight, Ship, Trash2 } from 'lucide-react';

interface ReplicaSetsProps {
  onComplete: () => void;
}

export const ReplicaSets: React.FC<ReplicaSetsProps> = ({ onComplete }) => {
  const [replicas, setReplicas] = useState(3);
  const [pods, setPods] = useState<{id: number}[]>([
    { id: 1 }, { id: 2 }, { id: 3 }
  ]);
  const [nextId, setNextId] = useState(4);

  // The Control Loop
  useEffect(() => {
    if (pods.length < replicas) {
      const timeout = setTimeout(() => {
        setPods(prev => [...prev, { id: nextId }]);
        setNextId(prev => prev + 1);
      }, 800); // Simulate startup time
      return () => clearTimeout(timeout);
    } else if (pods.length > replicas) {
      const timeout = setTimeout(() => {
        setPods(prev => prev.slice(0, replicas));
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [pods.length, replicas, nextId]);

  const killPod = (id: number) => {
    setPods(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h2 className="text-4xl font-bold text-white">The Clone Army: ReplicaSets</h2>
        <p className="text-xl text-indigo-200 max-w-2xl">
          In the real world, we rarely create a single Pod. We create a <strong>Deployment</strong>, 
          which manages a <strong>ReplicaSet</strong> to ensure we always have X copies running.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-12 items-start my-12">
        <div className="space-y-6">
          <div className="bg-indigo-900/30 p-6 rounded-xl border border-indigo-800/50">
            <h3 className="text-xl font-bold text-white mb-4">Desired State</h3>
            <p className="text-indigo-200 mb-6">
              You tell Kubernetes: "I want <span className="text-violet-400 font-bold">{replicas}</span> replicas."
              <br/>
              Kubernetes replies: "Say no more."
            </p>
            
            <div className="flex items-center gap-4 mb-6">
                <span className="text-indigo-300">Replicas:</span>
                <div className="flex items-center gap-2 bg-indigo-950 rounded-lg p-1 border border-indigo-800">
                    <button 
                        onClick={() => setReplicas(Math.max(0, replicas - 1))}
                        className="p-2 hover:bg-indigo-800 rounded text-indigo-300"
                    >
                        -
                    </button>
                    <span className="w-8 text-center font-mono text-xl font-bold">{replicas}</span>
                    <button 
                        onClick={() => setReplicas(replicas + 1)}
                        className="p-2 hover:bg-indigo-800 rounded text-indigo-300"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="p-4 bg-indigo-950/50 rounded-lg border border-indigo-800 text-sm font-mono text-fuchsia-300">
                <p>replicas: {replicas}</p>
                <p className="text-indigo-400"># Current Status</p>
                <p>availableReplicas: {pods.length}</p>
                <p className={pods.length === replicas ? "text-fuchsia-400" : "text-yellow-400"}>
                    status: {pods.length === replicas ? "Healthy" : "Reconciling..."}
                </p>
            </div>
          </div>

          <div className="bg-violet-900/20 p-4 rounded-lg border border-violet-500/30 text-violet-200 text-sm">
              <p><strong>Try this:</strong> Kill a pod by clicking the trash icon. Watch it come back automatically!</p>
          </div>
        </div>

        <div className="min-h-[400px] bg-indigo-950/50 rounded-2xl border border-indigo-800/50 p-8">
            <div className="grid grid-cols-2 gap-4">
                <AnimatePresence mode='popLayout'>
                    {pods.map((pod) => (
                        <motion.div
                            key={pod.id}
                            layout
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring" }}
                            className="bg-violet-600/20 border-2 border-violet-500 rounded-xl p-4 flex flex-col items-center gap-2 relative group"
                        >
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => killPod(pod.id)}
                                    className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <Ship size={40} className="text-violet-400" />
                            <span className="font-mono text-xs text-violet-300">pod-{pod.id}</span>
                            <span className="text-[10px] text-fuchsia-400 uppercase font-bold tracking-wider">Running</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
             
             {pods.length === 0 && replicas > 0 && (
                 <div className="flex items-center justify-center h-32 text-indigo-400 animate-pulse">
                     Deploying...
                 </div>
             )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onComplete} className="flex items-center gap-2">
          How do they talk? (Services) <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
};
