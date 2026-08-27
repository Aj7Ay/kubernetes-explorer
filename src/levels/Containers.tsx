import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { useTheme } from '../ThemeContext';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  Terminal,
  Database,
  Network,
  HardDrive,
  Trash2,
  Box,
  Globe,
  Server,
  Package,
  Download,
  Cloud,
  Lock,
  Route,
  Shield,
  CheckCircle,
  XCircle,
  FileCode,
  Zap,
  Eye,
  Play,
  Square,
} from 'lucide-react';

// Container types for demonstration
type ContainerType = 'web' | 'database' | 'cache' | 'messaging' | 'monitoring' | 'storage';

interface Container {
  id: string;
  name: string;
  type: ContainerType;
  status: 'running' | 'stopped' | 'error';
  cpu: string;
  memory: string;
  image: string;
  description: string;
}

const containers: Container[] = [
  {
    id: '1',
    name: 'Frontend App',
    type: 'web',
    status: 'running',
    cpu: '0.5 cores',
    memory: '512 MB',
    image: 'nginx:latest',
    description: 'React frontend server serving the user interface'
  },
  {
    id: '2',
    name: 'API Server',
    type: 'web',
    status: 'running',
    cpu: '1.0 cores',
    memory: '1.2 GB',
    image: 'node:18-alpine',
    description: 'Node.js backend API handling all business logic'
  },
  {
    id: '3',
    name: 'PostgreSQL',
    type: 'database',
    status: 'running',
    cpu: '0.8 cores',
    memory: '2.5 GB',
    image: 'postgres:15-alpine',
    description: 'Primary relational database storing all persistent data'
  },
  {
    id: '4',
    name: 'Redis Cache',
    type: 'cache',
    status: 'running',
    cpu: '0.3 cores',
    memory: '512 MB',
    image: 'redis:7-alpine',
    description: 'In-memory cache for session data and frequent queries'
  },
  {
    id: '5',
    name: 'Message Queue',
    type: 'messaging',
    status: 'running',
    cpu: '0.4 cores',
    memory: '768 MB',
    image: 'rabbitmq:3.12-alpine',
    description: 'Message broker for asynchronous job processing'
  },
  {
    id: '6',
    name: 'Monitoring',
    type: 'monitoring',
    status: 'running',
    cpu: '0.6 cores',
    memory: '1.0 GB',
    image: 'prometheus:latest',
    description: 'Prometheus metrics collector for system monitoring'
  },
  {
    id: '7',
    name: 'File Storage',
    type: 'storage',
    status: 'stopped',
    cpu: '0 cores',
    memory: '0 MB',
    image: 'minio:latest',
    description: 'MinIO S3-compatible object storage service'
  }
];

const getStatusColor = (status: Container['status']) => {
  switch (status) {
    case 'running':
      return 'text-green-500';
    case 'stopped':
      return 'text-gray-400';
    case 'error':
      return 'text-red-500';
  }
};

const getStatusBg = (status: Container['status']) => {
  switch (status) {
    case 'running':
      return 'bg-green-500/20';
    case 'stopped':
      return 'bg-gray-500/20';
    case 'error':
      return 'bg-red-500/20';
  }
};

const getStatusIcon = (status: Container['status']) => {
  switch (status) {
    case 'running':
      return <CheckCircle size={16} className="text-green-500" />;
    case 'stopped':
      return <Square size={16} className="text-gray-400" />;
    case 'error':
      return <XCircle size={16} className="text-red-500" />;
  }
};

const getTypeIcon = (type: ContainerType) => {
  switch (type) {
    case 'web':
      return <Globe size={20} className="text-blue-400" />;
    case 'database':
      return <Database size={20} className="text-purple-400" />;
    case 'cache':
      return <Zap size={20} className="text-yellow-400" />;
    case 'messaging':
      return <Package size={20} className="text-pink-400" />;
    case 'monitoring':
      return <Eye size={20} className="text-cyan-400" />;
    case 'storage':
      return <Box size={20} className="text-orange-400" />;
  }
};

const getTypeColor = (type: ContainerType) => {
  switch (type) {
    case 'web':
      return 'from-blue-500/20 to-blue-600/10';
    case 'database':
      return 'from-purple-500/20 to-purple-600/10';
    case 'cache':
      return 'from-yellow-500/20 to-yellow-600/10';
    case 'messaging':
      return 'from-pink-500/20 to-pink-600/10';
    case 'monitoring':
      return 'from-cyan-500/20 to-cyan-600/10';
    case 'storage':
      return 'from-orange-500/20 to-orange-600/10';
  }
};

interface Scene {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

interface ContainersProps {
  onComplete: () => void;
  onPrevScene?: () => void;
}

export const Containers: React.FC<ContainersProps> = ({ onComplete, onPrevScene }) => {
  const { isLight } = useTheme();
  const [currentScene, setCurrentScene] = useState<number>(0);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(containers[0]);
  const [expandedContainer, setExpandedContainer] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [expandedDetails, setExpandedDetails] = useState<{ [key: string]: boolean }>({});

  // Command history for terminal
  const [commandHistory, setCommandHistory] = useState<
    Array<{ command: string; output: string; timestamp: string }>
  >([
    {
      command: 'kubectl get pods',
      output: `NAME                                    READY   STATUS    RESTARTS   AGE
frontend-app-6c8f7b5d9c-x9k2l          1/1     Running   0          5d
api-server-7d9f8c6e0a-m3x8n            1/1     Running   2          4d
postgres-5d7c9b3a-z1p4q                1/1     Running   0          10d
redis-cache-3c8f7a1d-y9m2k              1/1     Running   1          7d`,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ]);

  const prevScene = () => {
    if (onPrevScene) {
      onPrevScene();
    }
  };

  const handleSelectContainer = (container: Container) => {
    setSelectedContainer(container);
    setSelectedContainerId(container.id);
  };

  const toggleDetails = (id: string) => {
    setExpandedDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const executeCommand = (command: string) => {
    let output = '';
    const timestamp = new Date().toISOString();

    // Simulate different command outputs
    if (command.includes('describe')) {
      const containerName = command.split(' ')[2];
      const container = containers.find(c => c.name.toLowerCase().includes(containerName?.toLowerCase() || ''));
      if (container) {
        output = `Name:         ${container.name}
Namespace:    default
Node:         worker-1
Status:       ${container.status}
IP:           10.244.1.${container.id}

Containers:
  ${container.name}:
    Image:          ${container.image}
    Port:           8080/TCP
    CPU Request:    ${container.cpu}
    Memory Request: ${container.memory}
    State:          ${container.status === 'running' ? 'Running' : 'Stopped'}`;
      } else {
        output = `Error: Container '${containerName}' not found`;
      }
    } else if (command.includes('logs')) {
      output = `2024-08-27T10:23:45.123Z INFO Application started
2024-08-27T10:23:46.456Z INFO Listening on port 8080
2024-08-27T10:23:47.789Z INFO Connected to database
2024-08-27T10:23:50.012Z DEBUG Received first request
2024-08-27T10:23:51.345Z INFO Request processed successfully`;
    } else if (command.includes('top')) {
      output = `NAME                    CPU(cores)   MEMORY(bytes)
frontend-app            125m         256Mi
api-server              450m         512Mi
postgres                380m         2Gi
redis-cache             120m         256Mi`;
    } else if (command.includes('get pods')) {
      output = `NAME                                    READY   STATUS    RESTARTS   AGE
frontend-app-6c8f7b5d9c-x9k2l          1/1     Running   0          5d
api-server-7d9f8c6e0a-m3x8n            1/1     Running   2          4d
postgres-5d7c9b3a-z1p4q                1/1     Running   0          10d
redis-cache-3c8f7a1d-y9m2k              1/1     Running   1          7d`;
    } else if (command.includes('exec')) {
      output = `$ pwd
/app
$ ls -la
total 128
drwxr-xr-x  4 root root  4096 Aug 27 10:20 .
drwxr-xr-x 1 root root  4096 Aug 27 10:15 ..
-rw-r--r--  1 root root    45 Aug 27 09:30 Dockerfile
-rw-r--r--  1 root root   421 Aug 27 09:30 package.json
drwxr-xr-x  2 root root  4096 Aug 27 10:00 src
drwxr-xr-x  3 root root  4096 Aug 27 10:10 node_modules`;
    } else if (command.includes('help')) {
      output = `Kubernetes Container Commands:

kubectl get pods                    - List all pods
kubectl describe pod <pod-name>     - Get detailed pod info
kubectl logs <pod-name>             - View pod logs
kubectl top pods                    - View resource usage
kubectl exec -it <pod> -- /bin/sh   - Connect to container
kubectl port-forward <pod> 8080:8080 - Forward port
kubectl apply -f <file>             - Deploy manifest
kubectl delete pod <pod-name>       - Delete pod`;
    } else {
      output = `Command not found: ${command}. Type 'help' for available commands.`;
    }

    setCommandHistory([...commandHistory, { command, output, timestamp }]);
  };

  // Scenes for the animation
  const scenes: Scene[] = [
    {
      id: 'intro',
      title: 'Containers: The Building Blocks',
      description: 'Understanding the basics',
      component: (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-lg border ${
              isLight
                ? 'bg-blue-50 border-blue-200'
                : 'bg-blue-900/20 border-blue-800'
            }`}
          >
            <p className="text-lg mb-4">
              Before Kubernetes, developers had to manually manage individual
              <strong className="text-mcb-100"> Docker containers</strong> on servers.
            </p>
            <p className="text-lg">
              They had to worry about:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-md">
              <li>Which server each container runs on</li>
              <li>Restarting containers when they crash</li>
              <li>Managing network connections between containers</li>
              <li>Scaling applications when load increases</li>
              <li>Rolling updates without downtime</li>
              <li>Resource allocation and optimization</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-between items-center"
          >
            <div className="text-4xl">😓</div>
            <ArrowRight className="text-mcb-100" size={40} />
            <div className="text-4xl">🤖</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`p-6 rounded-lg border ${
              isLight
                ? 'bg-green-50 border-green-200'
                : 'bg-green-900/20 border-green-800'
            }`}
          >
            <p className="text-lg">
              Kubernetes automates all of this. The clusters manage containers
              like a <strong className="text-mcb-100">conductor managing an orchestra</strong>.
            </p>
          </motion.div>

          <div className="flex justify-between gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button
              onClick={() => setCurrentScene(1)}
              className="text-lg px-8 py-4 flex items-center justify-center gap-2"
            >
              Next: Container Overview <ArrowRight />
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'overview',
      title: 'Container Overview',
      description: 'What do we have running?',
      component: (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg border mb-6 ${
              isLight
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-900/20 border-slate-800'
            }`}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Box size={24} className="text-mcb-100" />
              Running Containers in Our Cluster
            </h3>
            <p className="mb-4">
              Here's a snapshot of all the containers currently running in our Kubernetes cluster:
            </p>
            <div className="space-y-3">
              {containers.map((container, index) => (
                <motion.div
                  key={container.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSelectContainer(container)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedContainerId === container.id
                      ? `border-mcb-100 ${isLight ? 'bg-blue-50' : 'bg-blue-900/30'}`
                      : `border-${isLight ? 'slate-200' : 'slate-700'} ${isLight ? 'bg-white' : 'bg-slate-800/50'} hover:border-mcb-100`
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">{getTypeIcon(container.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold">{container.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBg(container.status)} ${getStatusColor(container.status)} flex items-center gap-1`}>
                            {getStatusIcon(container.status)}
                            <span>{container.status.charAt(0).toUpperCase() + container.status.slice(1)}</span>
                          </span>
                        </div>
                        <p className="text-sm opacity-70 mt-1">{container.description}</p>
                      </div>
                    </div>
                    <motion.div
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDetails(container.id);
                      }}
                    >
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${
                          expandedDetails[container.id] ? 'rotate-180' : ''
                        }`}
                      />
                    </motion.div>
                  </div>
                  {expandedDetails[container.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-current/20 space-y-2"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="opacity-70">Image:</span>
                          <p className="font-mono text-sm break-all">{container.image}</p>
                        </div>
                        <div>
                          <span className="opacity-70">Type:</span>
                          <p className="font-mono text-sm">{container.type}</p>
                        </div>
                        <div>
                          <span className="opacity-70">CPU:</span>
                          <p className="font-mono text-sm">{container.cpu}</p>
                        </div>
                        <div>
                          <span className="opacity-70">Memory:</span>
                          <p className="font-mono text-sm">{container.memory}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="flex justify-between gap-4 pt-4">
            <Button onClick={() => setCurrentScene(0)} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button
              onClick={() => setCurrentScene(2)}
              className="text-lg px-8 py-4 flex items-center justify-center gap-2"
            >
              Next: Detailed View <ArrowRight />
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'detailed',
      title: 'Container Details',
      description: 'Deep dive into a specific container',
      component: (
        <div className="space-y-6">
          {selectedContainer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-lg border ${
                isLight
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-lg bg-gradient-to-br ${getTypeColor(selectedContainer.type)}`}>
                  {getTypeIcon(selectedContainer.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{selectedContainer.name}</h3>
                  <p className="opacity-70 mt-2">{selectedContainer.description}</p>
                </div>
                <span className={`text-sm px-3 py-1 rounded-full font-bold ${getStatusBg(selectedContainer.status)} ${getStatusColor(selectedContainer.status)} flex items-center gap-2`}>
                  {getStatusIcon(selectedContainer.status)}
                  {selectedContainer.status.charAt(0).toUpperCase() + selectedContainer.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className={`p-4 rounded-lg ${
                  isLight ? 'bg-blue-50' : 'bg-blue-900/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={18} className="text-yellow-400" />
                    <span className="font-semibold">CPU Request</span>
                  </div>
                  <p className="text-xl font-mono">{selectedContainer.cpu}</p>
                </div>
                <div className={`p-4 rounded-lg ${
                  isLight ? 'bg-green-50' : 'bg-green-900/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive size={18} className="text-green-400" />
                    <span className="font-semibold">Memory Request</span>
                  </div>
                  <p className="text-xl font-mono">{selectedContainer.memory}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <FileCode size={20} />
                  Container Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="opacity-70 block text-sm mb-1">Container ID</label>
                    <code className={`block p-3 rounded font-mono text-sm break-all ${
                      isLight
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-slate-700 text-slate-100'
                    }`}>
                      {selectedContainer.id}
                    </code>
                  </div>
                  <div>
                    <label className="opacity-70 block text-sm mb-1">Container Type</label>
                    <code className={`block p-3 rounded font-mono text-sm ${
                      isLight
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-slate-700 text-slate-100'
                    }`}>
                      {selectedContainer.type}
                    </code>
                  </div>
                  <div>
                    <label className="opacity-70 block text-sm mb-1">Image</label>
                    <code className={`block p-3 rounded font-mono text-sm break-all ${
                      isLight
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-slate-700 text-slate-100'
                    }`}>
                      {selectedContainer.image}
                    </code>
                  </div>
                  <div>
                    <label className="opacity-70 block text-sm mb-1">Status</label>
                    <code className={`block p-3 rounded font-mono text-sm ${
                      isLight
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-slate-700 text-slate-100'
                    }`}>
                      {selectedContainer.status}
                    </code>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-between gap-4 pt-4">
            <Button onClick={() => setCurrentScene(1)} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button
              onClick={() => {
                setShowTerminal(true);
                setCurrentScene(3);
              }}
              className="text-lg px-8 py-4 flex items-center justify-center gap-2"
            >
              Next: Interactive Terminal <ArrowRight />
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'terminal',
      title: 'Interactive Terminal',
      description: 'Execute commands against containers',
      component: (
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${
              isLight
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-900/20 border-slate-800'
            }`}
          >
            <p>
              Below is an interactive terminal where you can execute commands against your containers using
              <strong className="text-mcb-100"> kubectl</strong>. This is how Kubernetes operators manage containers at scale.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg border font-mono text-sm ${
              isLight
                ? 'bg-slate-900 border-slate-700 text-slate-100'
                : 'bg-black border-slate-700 text-green-400'
            }`}
          >
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {commandHistory.map((entry, index) => (
                <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className={isLight ? 'text-blue-300' : 'text-green-400'}>
                    $ {entry.command}
                  </div>
                  <div
                    className={`ml-4 whitespace-pre-wrap text-xs ${
                      isLight ? 'text-slate-300' : 'text-green-300'
                    }`}
                  >
                    {entry.output}
                  </div>
                </motion.div>
              ))}
              <div className={`flex items-center gap-2 ${isLight ? 'text-blue-300' : 'text-green-400'}`}>
                <span>$</span>
                <input
                  type="text"
                  autoFocus
                  placeholder="Type command..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      executeCommand(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className={`flex-1 outline-none font-mono text-xs bg-transparent ${
                    isLight
                      ? 'text-blue-300 placeholder-blue-600'
                      : 'text-green-400 placeholder-green-700'
                  }`}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${
              isLight
                ? 'bg-blue-50 border-blue-200'
                : 'bg-blue-900/20 border-blue-800'
            }`}
          >
            <p className="text-sm font-semibold mb-2">Try these commands:</p>
            <ul className="text-sm space-y-1 font-mono">
              <li>• kubectl get pods</li>
              <li>• kubectl describe pod frontend-app-6c8f7b5d9c-x9k2l</li>
              <li>• kubectl logs api-server-7d9f8c6e0a-m3x8n</li>
              <li>• kubectl top pods</li>
              <li>• help</li>
            </ul>
          </motion.div>

          <div className="flex justify-between gap-4 pt-4">
            <Button onClick={() => setCurrentScene(2)} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button
              onClick={() => setCurrentScene(4)}
              className="text-lg px-8 py-4 flex items-center justify-center gap-2"
            >
              Next: Key Takeaways <ArrowRight />
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'takeaways',
      title: 'Key Takeaways',
      description: 'What you need to remember',
      component: (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg border ${
              isLight
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-900/20 border-slate-800'
            }`}
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <CheckCircle size={28} className="text-green-500" />
              What You've Learned
            </h3>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 mt-1">
                  <Check size={20} className="text-green-500" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Containers are fundamental units</h4>
                  <p className="opacity-70">
                    Kubernetes orchestrates containers (Docker, containerd, etc.) as the basic building blocks of
                    applications. Each container is isolated and self-contained.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 mt-1">
                  <Check size={20} className="text-green-500" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Kubernetes manages the lifecycle</h4>
                  <p className="opacity-70">
                    From deployment to scaling to rollouts to deletion, Kubernetes automatically manages containers
                    based on your desired state. No manual intervention needed.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 mt-1">
                  <Check size={20} className="text-green-500" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Multiple container types</h4>
                  <p className="opacity-70">
                    Kubernetes clusters often run different types of containers: web servers, databases, caches,
                    message brokers, and monitoring systems all working together seamlessly.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 mt-1">
                  <Check size={20} className="text-green-500" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Observability through kubectl</h4>
                  <p className="opacity-70">
                    The kubectl CLI tool provides comprehensive commands to inspect, debug, and manage containers
                    in your cluster. It's the primary interface for Kubernetes operators.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 mt-1">
                  <Check size={20} className="text-green-500" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Resource management</h4>
                  <p className="opacity-70">
                    Kubernetes tracks CPU and memory requests/limits for containers, ensuring optimal resource
                    allocation across your cluster and preventing resource conflicts.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg border ${
              isLight
                ? 'bg-green-50 border-green-200'
                : 'bg-green-900/20 border-green-800'
            }`}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Globe size={24} />
              What's Next?
            </h3>
            <p>
              Now that you understand containers, the next logical step is understanding how Kubernetes groups
              containers together into <strong className="text-mcb-100">Pods</strong> - the smallest deployable unit
              in Kubernetes. Pods are where containers live within a cluster.
            </p>
          </motion.div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={() => setCurrentScene(3)} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={onComplete} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
              Enter the Captain (Kubernetes) <ArrowRight />
            </Button>
          </div>
        </div>
      )
    }
  ];

  // Import ChevronDown icon
  const ChevronDown = ({ size, className }: { size: number; className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
      isLight
        ? 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200'
        : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <div className="mb-8">
          <motion.h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-mcb-100 via-mcb-100 to-mcb-200 bg-clip-text text-transparent">
            {scenes[currentScene].title}
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100px' }}
            className="h-1 bg-gradient-to-r from-mcb-100 to-mcb-200 rounded-full"
          />
        </div>

        <motion.div
          key={currentScene}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {scenes[currentScene].component}
        </motion.div>
      </motion.div>
    </div>
  );
};
