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

/* ── Typewriter terminal line component ── */
const TypewriterLine: React.FC<{
  text: string;
  delay: number;
  className?: string;
  cursor?: boolean;
}> = ({ text, delay, className = '', cursor = false }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, 20);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span className={className}>
      {displayed}
      {cursor && !done && <span className="animate-pulse">▊</span>}
    </span>
  );
};

/* ── Terminal Block component ── */
interface TerminalBlockCommand {
  label: string;
  description: string;
  command: string;
}

interface TerminalBlockProps {
  title: string;
  description: string;
  commands: TerminalBlockCommand[];
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'pink';
}

const TerminalBlock: React.FC<TerminalBlockProps> = ({
  title,
  description,
  commands,
  icon,
  color = 'blue',
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { isDark } = useTheme();

  const colorMap = {
    blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    green:
      'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    yellow:
      'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
    red: 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    purple:
      'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
    pink: 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300',
  };

  const selectedCommand = commands[selectedIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-l-4 rounded-lg p-4 mb-6 ${colorMap[color]}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="mt-1">{icon}</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{title}</h3>
          <p className="text-sm opacity-80 mb-4">{description}</p>
        </div>
      </div>

      {commands.length > 0 && (
        <div>
          {/* Command selector */}
          <div className="flex flex-wrap gap-2 mb-3">
            {commands.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                  selectedIndex === idx
                    ? 'bg-current opacity-100 text-black dark:text-white'
                    : 'bg-current opacity-30 hover:opacity-50'
                }`}
              >
                {cmd.label}
              </button>
            ))}
          </div>

          {/* Command display */}
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${
              isDark ? 'bg-gray-900' : 'bg-gray-100'
            } rounded p-3 font-mono text-sm overflow-x-auto`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 mr-2">$</span>
              <TypewriterLine
                text={selectedCommand.command}
                delay={isHovered ? 0 : 500}
                cursor={isHovered}
                className="text-green-600 dark:text-green-400"
              />
            </div>
            {selectedCommand.description && (
              <p className="text-gray-600 dark:text-gray-300 text-xs mt-2 italic">
                {selectedCommand.description}
              </p>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

interface ContentBlockProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const ContentBlock: React.FC<ContentBlockProps> = ({ title, children, icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-4 mb-6"
    >
      <div className="flex items-start gap-3">
        {icon && <div className="mt-1 text-blue-700 dark:text-blue-300">{icon}</div>}
        <div className="flex-1">
          <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100 mb-2">
            {title}
          </h3>
          <div className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface LevelContainerProps {
  children: React.ReactNode;
  isDark?: boolean;
}

const LevelContainer: React.FC<LevelContainerProps> = ({ children, isDark = false }) => {
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 py-12">{children}</div>
    </div>
  );
};

/* ── Main Containers Level Component ── */
export const Containers: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <LevelContainer isDark={isDark}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white flex items-center justify-center gap-3">
              <Box className="w-12 h-12 text-blue-500" />
              Containers
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Master the art of containerization with Docker
            </p>
          </motion.div>
        </div>

        {/* Main Content Sections */}
        <ContentBlock title="What are Containers?" icon={<Terminal />}>
          <p className="mb-3">
            Containers are lightweight, standalone, executable packages that contain everything
            needed to run an application: code, runtime, system tools, libraries, and settings.
          </p>
          <p className="mb-3">
            Think of containers like shipping containers for software. Just as shipping containers
            allow goods to be transported consistently regardless of the cargo, software containers
            ensure applications run consistently regardless of where the container is deployed.
          </p>
          <p>
            Docker is the industry-standard containerization platform that allows you to build,
            ship, and run containerized applications efficiently.
          </p>
        </ContentBlock>

        {/* Benefits Section */}
        <ContentBlock title="Why Use Containers?" icon={<CheckCircle />}>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>
                <strong>Consistency:</strong> "It works on my machine" becomes a non-issue. Your
                application runs the same everywhere.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>
                <strong>Isolation:</strong> Containers are isolated from each other and the host
                system, preventing conflicts between applications.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>
                <strong>Portability:</strong> Pack your application once and run it anywhere—local
                machine, cloud, or server.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>
                <strong>Efficiency:</strong> Containers are lightweight and fast to start, making
                better use of system resources than virtual machines.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>
                <strong>Scalability:</strong> Easily scale applications by running multiple
                container instances.
              </span>
            </li>
          </ul>
        </ContentBlock>

        {/* Docker Concepts */}
        <ContentBlock title="Key Docker Concepts" icon={<Database />}>
          <div className="space-y-4">
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-100 mb-2">Images</p>
              <p className="text-sm">
                A Docker image is a lightweight, standalone, executable package that includes the
                application code and all its dependencies. It's like a blueprint or template for
                creating containers.
              </p>
            </div>
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-100 mb-2">Containers</p>
              <p className="text-sm">
                A container is a running instance of a Docker image. You can think of it as the
                actual application running, while the image is the recipe.
              </p>
            </div>
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-100 mb-2">Registry</p>
              <p className="text-sm">
                A Docker registry (like Docker Hub) is a repository of Docker images. You can push
                your images there and pull them from anywhere.
              </p>
            </div>
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-100 mb-2">Volumes</p>
              <p className="text-sm">
                Volumes are used to persist data in Docker containers. They allow data to survive
                container restarts and be shared between containers.
              </p>
            </div>
          </div>
        </ContentBlock>

        {/* Dockerfile Section */}
        <ContentBlock title="Creating a Dockerfile" icon={<FileCode />}>
          <p className="mb-3">
            A Dockerfile is a text file containing instructions to build a Docker image. Here's a
            simple example:
          </p>
          <div
            className={`${
              isDark ? 'bg-gray-900' : 'bg-gray-100'
            } rounded-lg p-4 font-mono text-sm overflow-x-auto mb-3`}
          >
            <div className="text-gray-600 dark:text-gray-400">FROM node:18</div>
            <div className="text-gray-600 dark:text-gray-400">WORKDIR /app</div>
            <div className="text-gray-600 dark:text-gray-400">COPY . .</div>
            <div className="text-gray-600 dark:text-gray-400">RUN npm install</div>
            <div className="text-gray-600 dark:text-gray-400">EXPOSE 3000</div>
            <div className="text-gray-600 dark:text-gray-400">CMD ["npm", "start"]</div>
          </div>
          <p className="text-sm">
            Each instruction creates a layer in the image. Docker caches these layers for faster
            builds.
          </p>
        </ContentBlock>

        {/* Security Section */}
        <ContentBlock title="Container Security Best Practices" icon={<Shield />}>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">•</span>
              <span>
                <strong>Use minimal base images:</strong> Start with small, focused base images
                to reduce attack surface.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">•</span>
              <span>
                <strong>Run as non-root:</strong> Don't run your application as root inside
                containers.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">•</span>
              <span>
                <strong>Scan for vulnerabilities:</strong> Regularly scan your images for known
                vulnerabilities.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">•</span>
              <span>
                <strong>Limit resource usage:</strong> Set memory and CPU limits for containers to
                prevent resource exhaustion.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">•</span>
              <span>
                <strong>Keep images updated:</strong> Regularly update base images and dependencies
                to patch security vulnerabilities.
              </span>
            </li>
          </ul>
        </ContentBlock>

        {/* Networking Section */}
        <ContentBlock title="Docker Networking" icon={<Network />}>
          <p className="mb-3">
            Docker provides several networking options to connect containers and the outside world:
          </p>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-100 mb-1">Bridge Network (default)</p>
              <p>
                Containers on the same bridge network can communicate with each other using
                container names as hostnames.
              </p>
            </div>
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-100 mb-1">Host Network</p>
              <p>
                Containers share the host's network namespace, providing maximum performance but
                less isolation.
              </p>
            </div>
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-100 mb-1">Overlay Network</p>
              <p>
                Used in Docker Swarm to enable communication between containers running on different
                nodes.
              </p>
            </div>
          </div>
        </ContentBlock>

        {/* Storage Section */}
        <ContentBlock title="Docker Storage and Volumes" icon={<HardDrive />}>
          <p className="mb-3">
            Docker provides multiple options for managing data:
          </p>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-100 mb-1">Volumes</p>
              <p>
                Volumes are managed by Docker and stored outside the container's filesystem. They're
                ideal for databases and persistent data.
              </p>
            </div>
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-100 mb-1">Bind Mounts</p>
              <p>
                Allow you to mount a file or directory from the host into a container. Useful for
                development workflows.
              </p>
            </div>
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-100 mb-1">tmpfs Mounts</p>
              <p>
                Temporary filesystem mounts that exist only in memory. Perfect for sensitive data
                that shouldn't be persisted.
              </p>
            </div>
          </div>
        </ContentBlock>

        {/* Getting Started Section */}
        <ContentBlock title="Getting Started with Docker" icon={<Play />}>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="font-bold text-blue-900 dark:text-blue-100 flex-shrink-0">1.</span>
              <span>
                <strong>Install Docker:</strong> Download Docker Desktop from{' '}
                <a
                  href="https://www.docker.com/products/docker-desktop"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  docker.com
                </a>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-900 dark:text-blue-100 flex-shrink-0">2.</span>
              <span>
                <strong>Write a Dockerfile:</strong> Create a Dockerfile describing your application
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-900 dark:text-blue-100 flex-shrink-0">3.</span>
              <span>
                <strong>Build an image:</strong> Use `docker build` to create an image from your
                Dockerfile
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-900 dark:text-blue-100 flex-shrink-0">4.</span>
              <span>
                <strong>Run a container:</strong> Use `docker run` to create and start a container
                from your image
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-900 dark:text-blue-100 flex-shrink-0">5.</span>
              <span>
                <strong>Share your image:</strong> Push your image to Docker Hub or another registry
              </span>
            </li>
          </ol>
        </ContentBlock>

        {/* Real-World Applications */}
        <ContentBlock title="Real-World Container Use Cases" icon={<Globe />}>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">▸</span>
              <span>
                <strong>Microservices:</strong> Deploy services independently with their own
                dependencies
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">▸</span>
              <span>
                <strong>Development environments:</strong> Ensure developers have consistent
                environments
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">▸</span>
              <span>
                <strong>CI/CD pipelines:</strong> Build, test, and deploy applications in isolated
                environments
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">▸</span>
              <span>
                <strong>Data science:</strong> Package ML models and experiments with exact dependencies
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">▸</span>
              <span>
                <strong>Legacy app modernization:</strong> Run old applications in containers without
                major changes
              </span>
            </li>
          </ul>
        </ContentBlock>

        {/* Next Steps */}
        <ContentBlock title="Next Steps" icon={<ArrowRight />}>
          <p className="mb-3">
            You now have a solid understanding of containers and Docker. Here's what you should do
            next:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">→</span>
              <span>Experiment with Docker locally by creating and running simple containers</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">→</span>
              <span>Learn about container orchestration with Kubernetes</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">→</span>
              <span>Explore multi-container applications with Docker Compose</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">→</span>
              <span>Build and deploy your own containerized applications</span>
            </li>
          </ul>
        </ContentBlock>
      </motion.div>
    </LevelContainer>
  );
};
