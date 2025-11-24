import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { ArrowRight, ArrowLeft, Check, AlertTriangle, Terminal, Database, Network, HardDrive, Trash2, Box, Globe, Server, Package, Download, Cloud, Lock, Route } from 'lucide-react';

interface ContainersProps {
  onComplete: () => void;
}

export const Containers: React.FC<ContainersProps> = ({ onComplete }) => {
  const [scene, setScene] = useState(0);
  const [buildStep, setBuildStep] = useState(0);
  const [isRunExecuted, setIsRunExecuted] = useState(false);
  const [lifecycleStep, setLifecycleStep] = useState(0);
  const [composeStep, setComposeStep] = useState(0);

  const nextScene = () => setScene(prev => prev + 1);
  const prevScene = () => setScene(prev => Math.max(0, prev - 1));
  
  const layers = [
    { id: 'os', name: 'FROM ubuntu:22.04', desc: 'Base OS Layer', color: 'bg-slate-600' },
    { id: 'deps', name: 'RUN apt-get install python3', desc: 'Dependencies Layer', color: 'bg-blue-600' },
    { id: 'code', name: 'COPY . /app', desc: 'Application Code Layer', color: 'bg-yellow-500' },
    { id: 'config', name: 'ENV PORT=8080', desc: 'Configuration Layer', color: 'bg-green-500' },
  ];

  return (
    <div className="min-h-[600px] flex flex-col items-center text-center space-y-8 font-sans max-w-6xl mx-auto w-full">
      
      {/* Scene 0: The Concept */}
      {scene === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-3xl mx-auto">
            <h2 className="text-5xl font-extrabold text-white">The Standard Shipping Container</h2>
            <p className="text-xl text-indigo-200 leading-relaxed">
                Just as shipping containers standardized global trade, <strong>Docker</strong> standardized software delivery.
                It bundles code, runtime, libraries, and settings into a single package.
            </p>
            <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2 mx-auto">
                Let's Build One <ArrowRight />
            </Button>
        </motion.div>
      )}

      {/* Scene 1: Docker Build (The Layered Cake) */}
      {scene === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6 text-left">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Terminal className="text-violet-400" /> 
                    Step 1: docker build
                </h2>
                <p className="text-indigo-200">
                    A Docker image is an immutable file built from layers. Each instruction in a <code>Dockerfile</code> creates a new layer.
                </p>
                
                <div className="bg-black/40 p-4 rounded-xl font-mono text-sm space-y-2 border border-indigo-800">
                    <div className="mb-4 pb-2 border-b border-white/10 text-indigo-300 font-bold">
                        $ docker build -t my-app:v1 .
                    </div>
                    {layers.map((layer, index) => (
                        <div 
                            key={index}
                            className={`p-2 rounded transition-colors ${buildStep >= index ? 'text-white bg-indigo-900/50' : 'text-gray-500'}`}
                        >
                            {layer.name}
                        </div>
                    ))}
                </div>

                <Button 
                    onClick={() => setBuildStep(prev => Math.min(prev + 1, layers.length))} 
                    className="w-full"
                    disabled={buildStep >= layers.length}
                >
                    {buildStep < layers.length ? "Add Layer" : "Build Complete!"}
                </Button>
                
                {buildStep >= layers.length && (
                    <div className="flex gap-4">
                        <Button onClick={prevScene} variant="outline" className="flex-1 flex items-center justify-center gap-2">
                            <ArrowLeft size={20} /> Back
                        </Button>
                        <Button onClick={nextScene} variant="secondary" className="flex-1 flex items-center justify-center gap-2">
                            Next: Docker Run <ArrowRight />
                        </Button>
                    </div>
                )}
            </div>

            <div className="h-[400px] bg-indigo-950/50 rounded-2xl border-2 border-indigo-800 flex items-center justify-center p-8 relative overflow-hidden">
                <AnimatePresence mode="wait">
                {buildStep < layers.length ? (
                    <div className="flex flex-col-reverse items-center justify-start h-full w-full">
                         <AnimatePresence>
                            {layers.map((layer, index) => (
                                buildStep > index && (
                                <motion.div
                                    key={layer.id}
                                    initial={{ y: -200, opacity: 0, scale: 1.1 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                    className={`w-64 h-16 mb-1 rounded-lg flex items-center justify-center border border-white/10 text-white font-bold shadow-lg ${layer.color} relative z-${10-index}`}
                                >
                                    {layer.desc}
                                </motion.div>
                                )
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div
                        key="final-image"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="flex flex-col items-center justify-center"
                    >
                        <div className="w-48 h-48 bg-indigo-600 rounded-xl border-4 border-indigo-400 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)] relative">
                             <Package size={64} className="text-white mb-2" />
                             <span className="font-bold text-white text-lg">My App Image</span>
                             <span className="text-xs text-indigo-200 font-mono mt-1">v1.0.0</span>
                             
                             <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-dashed border-white/20 rounded-xl"
                             />
                        </div>
                        <motion.div 
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: 0.5 }}
                             className="mt-6 text-indigo-300 font-mono bg-indigo-900/50 px-4 py-2 rounded-lg"
                        >
                             IMAGE ID: a1b2c3d4
                        </motion.div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </motion.div>
      )}

      {/* Scene 2: Docker Run (Containerization) */}
      {scene === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
            <h2 className="text-3xl font-bold text-white">Step 2: docker run</h2>
            <p className="text-indigo-200 max-w-3xl mx-auto">
                To run an image, we create a writable layer on top of the read-only image. 
                This combination becomes the running <strong>Container</strong>.
            </p>

            <div className="h-[400px] bg-indigo-950/50 rounded-2xl border-2 border-indigo-800 relative overflow-hidden p-8 flex items-center justify-center">
                {!isRunExecuted ? (
                    <div className="text-center space-y-6">
                         <div className="w-32 h-32 bg-indigo-600 rounded-xl border-4 border-indigo-400 flex flex-col items-center justify-center shadow-lg mx-auto opacity-50 grayscale">
                             <Package size={40} className="text-white mb-2" />
                             <span className="font-bold text-white text-sm">My App Image</span>
                        </div>
                        <Button 
                            onClick={() => setIsRunExecuted(true)} 
                            className="text-lg px-8 py-4 flex items-center justify-center gap-2 mx-auto bg-green-600 hover:bg-green-700"
                        >
                            Execute: docker run <Terminal size={20} />
                        </Button>
                    </div>
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* The Base Image */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="absolute z-10 w-48 h-48 bg-indigo-800 rounded-xl border-2 border-indigo-500 flex flex-col items-center justify-center"
                        >
                            <Package size={48} className="text-indigo-300 mb-2" />
                            <span className="text-indigo-200 font-bold">Read-Only Image</span>
                        </motion.div>

                        {/* Writable Layer */}
                        <motion.div
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8, type: "spring" }}
                            className="absolute z-20 w-48 h-12 -mt-24 bg-green-500/90 rounded-t-xl border-2 border-green-400 flex items-center justify-center text-white font-bold text-sm shadow-lg"
                        >
                            Writable Layer
                        </motion.div>

                        {/* Ports */}
                        <motion.div
                            initial={{ x: -200, opacity: 0 }}
                            animate={{ x: -140, opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="absolute z-30 bg-blue-600 text-white p-2 rounded-lg flex items-center gap-2 shadow-lg"
                        >
                            <Network size={16} /> Port: 8080
                            <div className="absolute right-[-40px] top-1/2 h-1 w-10 bg-blue-600" />
                        </motion.div>

                        {/* Volumes */}
                        <motion.div
                            initial={{ x: 200, opacity: 0 }}
                            animate={{ x: 140, opacity: 1 }}
                            transition={{ delay: 1.8 }}
                            className="absolute z-30 bg-yellow-600 text-white p-2 rounded-lg flex items-center gap-2 shadow-lg"
                        >
                            <div className="absolute left-[-40px] top-1/2 h-1 w-10 bg-yellow-600" />
                            Vol: /data <HardDrive size={16} />
                        </motion.div>

                        {/* Container Boundary */}
                        <motion.div
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 2.5 }}
                            className="absolute z-40 w-80 h-80 border-4 border-dashed border-white/30 rounded-3xl flex items-end justify-center pb-4"
                        >
                            <motion.div 
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-green-400 font-mono font-bold bg-green-900/50 px-4 py-1 rounded-full"
                            >
                                STATUS: RUNNING
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </div>

            <div className="bg-black/50 p-6 rounded-xl font-mono text-left border border-indigo-700 max-w-2xl mx-auto mt-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 bg-indigo-900/50 rounded-bl-lg text-xs text-indigo-300">Terminal</div>
                <p className="text-gray-500"># The command we just visualized:</p>
                <p className="text-white mt-2">
                    docker run -d \<br/>
                    <span className={isRunExecuted ? "text-blue-400 font-bold" : "text-gray-400"}>  -p 80:8080 \</span><br/>
                    <span className={isRunExecuted ? "text-yellow-400 font-bold" : "text-gray-400"}>  -v /host/data:/app/data \</span><br/>
                    <span className="text-green-400">  my-app:latest</span>
                </p>
            </div>

            <div className="flex justify-center gap-4 pt-8">
                <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
                    <ArrowLeft size={20} /> Back
                </Button>
                <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                    Next: Lifecycle <ArrowRight />
                </Button>
            </div>
        </motion.div>
      )}

      {/* Scene 3: Lifecycle (Stop, Remove, Prune, Pull) */}
      {scene === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
            <h2 className="text-3xl font-bold text-white">Step 3: The Lifecycle</h2>
            <p className="text-indigo-200 max-w-3xl mx-auto">
                Containers are transient. We stop them, remove them, and clean up dangling resources.
            </p>

            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4 text-left">
                    <Button 
                        onClick={() => setLifecycleStep(1)} 
                        variant={lifecycleStep === 1 ? "primary" : "outline"}
                        className="w-full justify-start"
                    >
                        1. docker stop container_id
                    </Button>
                    <Button 
                        onClick={() => setLifecycleStep(2)} 
                        variant={lifecycleStep === 2 ? "primary" : "outline"}
                        className="w-full justify-start"
                        disabled={lifecycleStep < 1}
                    >
                        2. docker rm container_id
                    </Button>
                    <Button 
                        onClick={() => setLifecycleStep(3)} 
                        variant={lifecycleStep === 3 ? "primary" : "outline"}
                        className="w-full justify-start"
                        disabled={lifecycleStep < 2}
                    >
                        3. docker system prune
                    </Button>
                     <Button 
                        onClick={() => setLifecycleStep(4)} 
                        variant={lifecycleStep === 4 ? "primary" : "outline"}
                        className="w-full justify-start"
                        disabled={lifecycleStep < 3}
                    >
                        4. docker pull nginx:latest
                    </Button>
                </div>

                <div className="bg-indigo-950/50 h-64 rounded-2xl border-2 border-indigo-800 flex items-center justify-center relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {lifecycleStep === 0 && (
                            <motion.div
                                key="running"
                                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                className="w-32 h-32 bg-green-500 rounded-xl flex flex-col items-center justify-center shadow-lg border-4 border-green-400"
                            >
                                <Box className="text-white mb-2" size={40} />
                                <span className="font-bold text-white">Running</span>
                            </motion.div>
                        )}
                        {lifecycleStep === 1 && (
                            <motion.div
                                key="stopped"
                                initial={{ scale: 1, filter: "grayscale(0%)" }} 
                                animate={{ scale: 1, filter: "grayscale(100%)", opacity: 0.5 }} 
                                exit={{ scale: 0 }}
                                className="w-32 h-32 bg-green-500 rounded-xl flex flex-col items-center justify-center shadow-lg border-4 border-green-400"
                            >
                                <Box className="text-white mb-2" size={40} />
                                <span className="font-bold text-white">Stopped</span>
                            </motion.div>
                        )}
                        {lifecycleStep === 2 && (
                            <motion.div
                                key="removed"
                                initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col gap-4 w-full px-8"
                            >
                                <div className="bg-yellow-900/50 border border-yellow-600 p-3 rounded text-yellow-200 text-xs font-mono flex items-center gap-2">
                                    <HardDrive size={14} /> Dangling Volume
                                </div>
                                <div className="bg-slate-700/50 border border-slate-600 p-3 rounded text-slate-300 text-xs font-mono flex items-center gap-2">
                                    <Box size={14} /> &lt;none&gt; Dangling Image
                                </div>
                            </motion.div>
                        )}
                        {lifecycleStep === 3 && (
                            <motion.div
                                key="prune"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center text-fuchsia-400"
                            >
                                <Trash2 size={64} />
                                <span className="font-bold mt-4">System Pruned!</span>
                                <span className="text-xs text-indigo-400">All unused artifacts deleted</span>
                            </motion.div>
                        )}
                        {lifecycleStep === 4 && (
                            <motion.div
                                key="pull"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex flex-col items-center"
                            >
                                <div className="relative">
                                    <Cloud size={64} className="text-blue-400" />
                                    <motion.div
                                        initial={{ y: 0, opacity: 0 }}
                                        animate={{ y: 20, opacity: 1 }}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-blue-200"
                                    >
                                        <Download size={24} />
                                    </motion.div>
                                </div>
                                <span className="font-bold mt-4 text-white">Pulling nginx...</span>
                                <div className="w-32 h-2 bg-indigo-900 rounded-full mt-2 overflow-hidden">
                                    <motion.div 
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1.5 }}
                                        className="h-full bg-blue-500"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex justify-center gap-4 pt-8">
                <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
                    <ArrowLeft size={20} /> Back
                </Button>
                <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                    Next: Docker Compose <ArrowRight />
                </Button>
            </div>
        </motion.div>
      )}

            {/* Scene 4: Docker Compose (Traefik + Apps) */}
      {scene === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
            <h2 className="text-3xl font-bold text-white">Step 4: Orchestration with Compose</h2>
            <p className="text-indigo-200 max-w-3xl mx-auto">
                We define multi-container apps in <code>docker-compose.yml</code>. 
                Here, we set up a <strong>Traefik</strong> reverse proxy to handle HTTPS and route traffic to our services.
            </p>

            <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="bg-black/40 p-6 rounded-xl font-mono text-sm text-left border border-indigo-800 h-full overflow-auto">
                    <p className="text-fuchsia-400 mb-2"># docker-compose.yml</p>
                    <div className="text-indigo-300">services:</div>
                    <div className="pl-4 text-orange-400">reverse-proxy:</div>
                    <div className="pl-8 text-white">image: traefik:v2</div>
                    <div className="pl-8 text-white">ports: ["443:443"]</div>
                    <div className="pl-4 text-green-400">web:</div>
                    <div className="pl-8 text-white">image: my-frontend</div>
                    <div className="pl-8 text-white">labels:</div>
                    <div className="pl-12 text-gray-400">- "traefik.http.routers.web.rule=Host(`example.com`)"</div>
                    <div className="pl-4 text-blue-400">api:</div>
                    <div className="pl-8 text-white">image: my-backend</div>
                    <div className="pl-4 text-yellow-400">db:</div>
                    <div className="pl-8 text-white">image: postgres</div>
                </div>

                <div className="relative h-[600px] bg-indigo-950/30 rounded-xl border border-indigo-800/50 flex flex-col items-center justify-center p-4 overflow-hidden">
                    {composeStep === 0 && (
                        <Button 
                            onClick={() => setComposeStep(1)} 
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 scale-110 z-50"
                        >
                            <Terminal size={20} /> docker compose up -d
                        </Button>
                    )}

                    <AnimatePresence>
                        {composeStep > 0 && (
                            <div className="relative w-full h-full font-sans">
                                {/* Terminal Overlay */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: [0, 1, 1, 0], y: 0 }}
                                    transition={{ duration: 2.5, times: [0, 0.1, 0.9, 1] }}
                                    className="absolute top-4 left-0 right-0 mx-auto w-3/4 bg-black/90 text-green-400 font-mono text-xs p-4 rounded-lg border border-green-500/30 z-40 shadow-2xl"
                                >
                                    $ docker compose up -d<br/>
                                    <span className="text-white">Creating network "app_default"...</span><br/>
                                    <span className="text-white">Creating container "db"...</span><br/>
                                    <span className="text-white">Creating container "api"...</span><br/>
                                    <span className="text-white">Creating container "web"...</span><br/>
                                    <span className="text-white">Creating container "traefik"...</span>
                                    <span className="text-green-500 font-bold mt-2 block">Done!</span>
                                </motion.div>

                                {/* Network Boundary */}
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 2.2 }}
                                    className="absolute top-[160px] bottom-[20px] left-[5%] right-[5%] border-2 border-dashed border-indigo-500/40 rounded-3xl bg-indigo-900/10 -z-10"
                                >
                                    <span className="absolute top-3 right-4 text-indigo-400 text-xs font-mono bg-indigo-950/50 px-2 py-1 rounded">
                                        Network: app_default
                                    </span>
                                </motion.div>

                                {/* Nodes (Absolute Positioning for Precise Lines) */}
                                
                                {/* Internet */}
                                <motion.div 
                                    initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2.2 }}
                                    className="absolute top-[30px] left-1/2 -translate-x-1/2 flex items-center gap-2 text-white z-20"
                                >
                                    <Cloud className="text-blue-400" /> Internet (HTTPS)
                                </motion.div>

                                {/* Traefik (Center) */}
                                <motion.div 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.5 }}
                                    className="absolute top-[100px] left-1/2 -translate-x-1/2 w-32 h-16 bg-orange-600 rounded-lg flex items-center justify-center gap-2 text-white font-bold shadow-lg z-20"
                                >
                                    <Route size={20} /> Traefik
                                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-sm">
                                        <Lock size={12} />
                                    </div>
                                </motion.div>

                                {/* Web (Left) */}
                                <motion.div 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3.0 }}
                                    className="absolute top-[220px] left-[25%] -translate-x-1/2 w-32 h-24 bg-green-600 rounded-lg flex flex-col items-center justify-center text-white shadow-lg z-20"
                                >
                                    <Globe size={24} className="mb-2" /> 
                                    <span className="font-bold">Web</span>
                                    <span className="text-xs opacity-75">my-frontend</span>
                                </motion.div>

                                {/* API (Right) */}
                                <motion.div 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3.2 }}
                                    className="absolute top-[220px] left-[75%] -translate-x-1/2 w-32 h-24 bg-blue-600 rounded-lg flex flex-col items-center justify-center text-white shadow-lg z-20"
                                >
                                    <Server size={24} className="mb-2" /> 
                                    <span className="font-bold">API</span>
                                    <span className="text-xs opacity-75">my-backend</span>
                                </motion.div>

                                {/* DB (Below API) */}
                                <motion.div 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3.5 }}
                                    className="absolute top-[380px] left-[75%] -translate-x-1/2 w-32 h-16 bg-yellow-600 rounded-lg flex flex-col items-center justify-center text-white shadow-lg z-20"
                                >
                                    <div className="flex items-center gap-2">
                                        <Database size={16} /> 
                                        <span className="font-bold">DB</span>
                                    </div>
                                    <span className="text-xs opacity-75">postgres</span>
                                </motion.div>

                                {/* Connections and Traffic */}
                                <svg 
                                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                                    viewBox="0 0 100 600"
                                    preserveAspectRatio="none"
                                >
                                    <defs>
                                        <marker id="arrow-blue" markerWidth="4" markerHeight="4" refX="4" refY="2" orient="auto">
                                            <path d="M0,0 L0,4 L4,2 z" fill="#60a5fa" />
                                        </marker>
                                        <marker id="arrow-green" markerWidth="4" markerHeight="4" refX="4" refY="2" orient="auto">
                                            <path d="M0,0 L0,4 L4,2 z" fill="#4ade80" />
                                        </marker>
                                        <marker id="arrow-yellow" markerWidth="4" markerHeight="4" refX="4" refY="2" orient="auto">
                                            <path d="M0,0 L0,4 L4,2 z" fill="#facc15" />
                                        </marker>
                                    </defs>

                                    {/* Internet to Traefik */}
                                    <motion.line 
                                        x1="50" y1="50" x2="50" y2="95" 
                                        stroke="#60a5fa" strokeWidth="0.5" strokeDasharray="2 1"
                                        vectorEffect="non-scaling-stroke"
                                        initial={{ opacity: 0, strokeDashoffset: 0 }}
                                        animate={{ opacity: 1, strokeDashoffset: -6 }}
                                        transition={{ 
                                            opacity: { delay: 4.0, duration: 0.5 },
                                            strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" }
                                        }}
                                        markerEnd="url(#arrow-blue)"
                                    />
                                    
                                    {/* Traefik to Web (Left) */}
                                    <motion.path 
                                        d="M 50 164 L 50 190 L 25 190 L 25 215" 
                                        fill="none" stroke="#4ade80" strokeWidth="0.5" strokeDasharray="2 1"
                                        vectorEffect="non-scaling-stroke"
                                        initial={{ opacity: 0, strokeDashoffset: 0 }}
                                        animate={{ opacity: 1, strokeDashoffset: -6 }}
                                        transition={{ 
                                            opacity: { delay: 4.0, duration: 0.5 },
                                            strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" }
                                        }}
                                        markerEnd="url(#arrow-green)"
                                    />
                                    
                                    {/* Web to API (Horizontal) */}
                                    <motion.line 
                                        x1="33" y1="268" x2="67" y2="268"
                                        stroke="#4ade80" strokeWidth="0.5" strokeDasharray="2 1"
                                        vectorEffect="non-scaling-stroke"
                                        initial={{ opacity: 0, strokeDashoffset: 0 }}
                                        animate={{ opacity: 1, strokeDashoffset: -6 }}
                                        transition={{ 
                                            opacity: { delay: 4.0, duration: 0.5 },
                                            strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" }
                                        }}
                                        markerEnd="url(#arrow-green)"
                                    />
                                    
                                    {/* API to DB */}
                                    <motion.line 
                                        x1="75" y1="316" x2="75" y2="375" 
                                        stroke="#facc15" strokeWidth="0.5" strokeDasharray="2 1"
                                        vectorEffect="non-scaling-stroke"
                                        initial={{ opacity: 0, strokeDashoffset: 0 }}
                                        animate={{ opacity: 1, strokeDashoffset: -6 }}
                                        transition={{ 
                                            opacity: { delay: 4.0, duration: 0.5 },
                                            strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" }
                                        }}
                                        markerEnd="url(#arrow-yellow)"
                                    />
                                </svg>

                                {/* Animated Packets */}
                                <div className="absolute inset-0 pointer-events-none z-30 font-sans">
                                    {/* Packet 1: Internet -> Traefik */}
                                    <motion.div
                                        initial={{ left: "50%", top: 50, opacity: 0 }} 
                                        animate={{ top: 95, opacity: [0, 1, 1, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 5.0 }}
                                        className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white] -translate-x-1/2 -translate-y-1/2"
                                    />

                                    {/* Packet 2: Traefik -> Web */}
                                    <motion.div
                                        initial={{ left: "50%", top: 164, opacity: 0 }} 
                                        animate={{ 
                                            left: ["50%", "50%", "25%", "25%"],
                                            top: [164, 190, 190, 215],
                                            opacity: [0, 1, 1, 0]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 5.5 }}
                                        className="absolute w-3 h-3 bg-green-400 rounded-full shadow-[0_0_10px_#4ade80] -translate-x-1/2 -translate-y-1/2"
                                    />

                                    {/* Packet 4: Web -> API */}
                                    <motion.div
                                        initial={{ left: "25%", top: 268, opacity: 0 }} 
                                        animate={{ left: "75%", opacity: [0, 1, 1, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 6.2 }}
                                        className="absolute w-3 h-3 bg-green-400 rounded-full shadow-[0_0_10px_#4ade80] -translate-x-1/2 -translate-y-1/2"
                                    />

                                    {/* Packet 5: API -> DB */}
                                    <motion.div
                                        initial={{ left: "75%", top: 316, opacity: 0 }} 
                                        animate={{ top: 375, opacity: [0, 1, 1, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 7.0 }}
                                        className="absolute w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_10px_#facc15] -translate-x-1/2 -translate-y-1/2"
                                    />
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 8.0 }}
                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-900/90 text-green-300 px-4 py-2 rounded-full text-sm font-bold border border-green-500 flex items-center gap-2 z-50 shadow-xl"
                                    style={{ zIndex: 50 }}
                                >
                                    <Check size={16} /> Stack Operational
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex justify-center gap-4 pt-8">
                <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
                    <ArrowLeft size={20} /> Back
                </Button>
                <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                    Next: Reality Check <ArrowRight />
                </Button>
            </div>
        </motion.div>
      )}

      {/* Scene 5: Pros & Cons Review */}
      {scene === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
            <h2 className="text-4xl font-bold text-white">The Reality Check</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-emerald-900/20 p-6 rounded-2xl border border-emerald-500/30 text-left">
                    <h3 className="text-2xl font-bold text-emerald-100 mb-4 flex items-center gap-2">
                        <Check /> Why we love it
                    </h3>
                    <ul className="space-y-3 text-emerald-200">
                        <li>✅ <strong>Consistent Environment:</strong> Works same on laptop & server.</li>
                        <li>✅ <strong>Cost-Effective:</strong> Efficient resource usage.</li>
                        <li>✅ <strong>Isolation:</strong> Apps don't conflict.</li>
                    </ul>
                </div>

                    <div className="bg-red-900/20 p-6 rounded-2xl border border-red-500/30 text-left">
                        <h3 className="text-2xl font-bold text-red-100 mb-4 flex items-center gap-2">
                            <AlertTriangle /> The Missing Pieces
                        </h3>
                        <ul className="space-y-3 text-red-200">
                            <li>❌ <strong>Limited Self-Healing:</strong> <code>restart: always</code> works for app crashes, but if the <strong>Server</strong> dies, your app stays down.</li>
                            <li>❌ <strong>Complex Updates:</strong> Native Docker Compose recreates containers. Zero-downtime requires extra tools (like <code>docker-rollout</code>) or manual scripting.</li>
                            <li>❌ <strong>No Auto-Scaling:</strong> Can't automatically add more containers during traffic spikes.</li>
                        </ul>
                    </div>
            </div>

            <div className="pt-8">
                <p className="text-xl text-indigo-200 mb-6">
                    Docker solves the "Package" problem. But who solves the "Management" problem?
                </p>
                <div className="flex justify-center gap-4">
                    <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
                        <ArrowLeft size={20} /> Back
                    </Button>
                    <Button onClick={onComplete} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                        Enter the Captain (Kubernetes) <ArrowRight />
                    </Button>
                </div>
            </div>
        </motion.div>
      )}

    </div>
  );
};
