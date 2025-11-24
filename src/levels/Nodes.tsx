import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { ArrowRight, Server, Ship, AlertTriangle, RefreshCw } from 'lucide-react';

interface NodesProps {
  onComplete: () => void;
}

export const Nodes: React.FC<NodesProps> = ({ onComplete }) => {
  const [nodeStatus, setNodeStatus] = useState<'healthy' | 'failed' | 'recovering'>('healthy');
  const [pods, setPods] = useState<{id: number, nodeId: 1 | 2}[]>([
    { id: 1, nodeId: 1 },
    { id: 2, nodeId: 1 },
    { id: 3, nodeId: 2 },
    { id: 4, nodeId: 2 },
  ]);

  const failNode = () => {
    setNodeStatus('failed');
    // After failure, create NEW pods on the healthy node
    setTimeout(() => {
      setNodeStatus('recovering');
      setTimeout(() => {
        // IMPORTANT: We map to NEW objects to simulate rescheduling (creation of new pods)
        // In a real scenario, the old pods terminate and new ones start.
        setPods(prev => {
            const healthyPods = prev.filter(p => p.nodeId === 2);
            const newPods = [
                { id: 5, nodeId: 2 }, // New Pod ID
                { id: 6, nodeId: 2 }  // New Pod ID
            ];
            return [...healthyPods, ...newPods] as {id: number, nodeId: 1 | 2}[];
        });
        setNodeStatus('healthy');
      }, 1000);
    }, 1000);
  };

  const reset = () => {
    setPods([
        { id: 1, nodeId: 1 },
        { id: 2, nodeId: 1 },
        { id: 3, nodeId: 2 },
        { id: 4, nodeId: 2 },
    ]);
    setNodeStatus('healthy');
  };

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h2 className="text-4xl font-bold text-white">The Fleet: Worker Nodes</h2>
        <p className="text-xl text-indigo-200 max-w-2xl">
          Pods need a place to live. They run on <strong>Nodes</strong>. 
          Think of Nodes as the ships in our fleet.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-12 items-center my-12">
        <div className="space-y-6">
          <div className="bg-indigo-900/30 p-6 rounded-xl border border-indigo-800/50">
            <h3 className="text-xl font-bold text-white mb-4">The Scheduler</h3>
            <p className="text-indigo-200 mb-4">
              Kubernetes has a component called the <strong>Scheduler</strong>. It watches for new Pods and assigns them to the best available Node.
            </p>
            <p className="text-indigo-200 mb-6">
              If a Node fails (ship sinks), the Scheduler doesn't "move" the Pod. It <strong>reschedules</strong> (creates new copies) of them on a healthy Node.
            </p>
            
            <div className="flex gap-4">
                <Button 
                    onClick={failNode} 
                    variant="secondary"
                    disabled={nodeStatus !== 'healthy' || pods.every(p => p.nodeId === 2)}
                    className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
                >
                    Simulate Node Failure <AlertTriangle size={18} className="ml-2"/>
                </Button>
                <Button 
                    onClick={reset} 
                    variant="outline"
                    disabled={nodeStatus !== 'healthy'}
                >
                    <RefreshCw size={18} />
                </Button>
            </div>
          </div>
        </div>

        <div className="relative bg-indigo-950/50 rounded-2xl border border-indigo-800/50 p-8 min-h-[400px] flex flex-col gap-8">
           
           {/* Node 1 */}
           <div className={`relative border-2 rounded-xl p-4 transition-colors duration-500 ${nodeStatus === 'failed' ? 'border-red-500 bg-red-500/10' : 'border-fuchsia-500 bg-fuchsia-500/10'}`}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Server size={24} className={nodeStatus === 'failed' ? 'text-red-500' : 'text-fuchsia-500'} />
                        <span className="font-bold text-white">Node 1 (SS Worker)</span>
                    </div>
                    {nodeStatus === 'failed' && <span className="text-red-400 font-mono animate-pulse">OFFLINE</span>}
                </div>
                
                <div className="grid grid-cols-4 gap-2 h-16">
                    {pods.filter(p => p.nodeId === 1).map(p => (
                        <motion.div
                            layoutId={`pod-${p.id}`}
                            className="bg-violet-500 rounded-lg flex items-center justify-center"
                        >
                            <Ship size={16} className="text-white" />
                        </motion.div>
                    ))}
                </div>
           </div>

           {/* Node 2 */}
           <div className="relative border-2 border-fuchsia-500 bg-fuchsia-500/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Server size={24} className="text-fuchsia-500" />
                        <span className="font-bold text-white">Node 2 (SS Backup)</span>
                    </div>
                    <span className="text-fuchsia-400 font-mono">ONLINE</span>
                </div>
                
                <div className="grid grid-cols-4 gap-2 h-16">
                    {pods.filter(p => p.nodeId === 2).map(p => (
                        <motion.div
                            key={p.id} // Use unique key for new pods to trigger mount animation
                            layoutId={p.id < 5 ? `pod-${p.id}` : undefined} // Only animate layout for existing pods
                            initial={p.id >= 5 ? { scale: 0, opacity: 0 } : undefined}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-violet-500 rounded-lg flex items-center justify-center shadow-lg"
                        >
                             <Ship size={16} className="text-white" />
                        </motion.div>
                    ))}
                </div>
           </div>

           {nodeStatus === 'recovering' && (
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-indigo-950/60 backdrop-blur-sm z-10 rounded-2xl"
               >
                   <div className="bg-indigo-900 p-4 rounded-lg border border-indigo-700 flex items-center gap-3">
                       <RefreshCw className="animate-spin text-violet-400" />
                       <span className="text-white font-mono">Rescheduling Pods...</span>
                   </div>
               </motion.div>
           )}

        </div>
      </div>

      {pods.every(p => p.nodeId === 2) && nodeStatus === 'healthy' && (
         <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end pt-4"
        >
          <Button onClick={onComplete} className="flex items-center gap-2">
            Understand the Fleet (ReplicaSets) <ArrowRight size={20} />
          </Button>
        </motion.div>
      )}
    </div>
  );
};
