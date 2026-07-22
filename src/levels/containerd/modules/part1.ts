import type { Module } from '../types';

export const part1Modules: Module[] = [
  {
    id: 'intro',
    part: 'Part 1 · Foundations',
    title: 'What is ContainerD',
    short: 'Intro',
    icon: 'Cog',
    lessons: [
      {
        id: 'intro-engine',
        title: 'The Engine Room',
        subtitle: 'containerd is the industry-standard core container runtime',
        blocks: [
          {
            type: 'text',
            body: 'ContainerD (pronounced "container-dee") is an industry-standard core container runtime that manages the complete container lifecycle on a host: image transfer and storage, container execution and supervision, low-level storage, and network attachments.',
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Car analogy',
            body: 'Docker is the steering wheel and dashboard. containerd is the engine. Whether you use Docker, Kubernetes, or nerdctl - containerd is usually doing the heavy lifting.',
          },
          {
            type: 'demo',
            demoId: 'VisualCarAnalogy',
          },
          {
            type: 'demo',
            demoId: 'DemoEngineIntro',
          },
          {
            type: 'cards',
            title: 'What containerd actually does',
            items: [
              { title: 'Image management', body: 'Pull/push, content-addressable storage, layer dedup, metadata', tag: 'Images', color: 'blue' },
              { title: 'Lifecycle', body: 'Create, start, monitor, stop, remove containers and tasks', tag: 'Tasks', color: 'green' },
              { title: 'Snapshots', body: 'overlayfs / btrfs / zfs / stargz snapshotter plugins', tag: 'Storage', color: 'orange' },
              { title: 'Networking hooks', body: 'CNI integration, network namespace setup (not full Docker networks)', tag: 'CNI', color: 'sky' },
              { title: 'CRI plugin', body: 'Kubernetes talks to containerd via CRI over gRPC', tag: 'K8s', color: 'mcb' },
              { title: 'Multi-runtime', body: 'runc (default), gVisor, Kata, Firecracker via OCI plugins', tag: 'Runtime', color: 'yellow' },
            ],
          },
          {
            type: 'commands',
            title: 'Is containerd running?',
            items: [
              { cmd: 'systemctl status containerd', note: 'systemd service status' },
              { cmd: 'ls -l /run/containerd/containerd.sock', note: 'gRPC API socket clients talk to', out: 'srwxr-xr-x 1 root root 0 /run/containerd/containerd.sock' },
              { cmd: 'ctr version', note: 'client + server versions' },
            ],
          },
          {
            type: 'checklist',
            title: 'What containerd is NOT',
            items: [
              { label: 'No friendly daily CLI (ctr is for debug; use nerdctl/docker for DX)', ok: false },
              { label: 'No image building (use BuildKit / docker build / nerdctl build)', ok: false },
              { label: 'No multi-host orchestration (use Kubernetes)', ok: false },
              { label: 'No Docker-like high-level network/volume UX', ok: false },
            ],
          },
          {
            type: 'steps',
            kind: 'lab',
            goal: 'Confirm containerd is installed and running on this host.',
            steps: [
              { title: 'Check the systemd service', detail: 'containerd should be an active, running service.', cmd: 'systemctl status containerd' },
              { title: 'Check the gRPC socket', detail: 'Clients talk to containerd over this Unix socket file - if it exists, the daemon is listening.', cmd: 'ls -l /run/containerd/containerd.sock' },
              { title: 'Query the daemon', detail: 'Ask containerd directly for its version over the socket.', cmd: 'ctr version' },
              { title: 'Verify', detail: 'Re-run ctr version - success means both a Client and a Server version print, confirming the daemon answered your request.', cmd: 'ctr version' },
            ],
          },
        ],
      },
      {
        id: 'intro-daemon',
        title: 'Daemon, Socket & Clients',
        blocks: [
          {
            type: 'text',
            body: 'containerd runs as a system daemon and listens on a Unix socket. Clients (Docker Engine, kubelet CRI, nerdctl, ctr, custom Go clients) speak gRPC to that socket.',
          },
          {
            type: 'diagram',
            title: 'Client stack',
            lines: [
              '┌─ User-friendly ──────────────────────────┐',
              '│  docker · nerdctl · kubectl               │',
              '└──────────────────┬───────────────────────┘',
              '                   │',
              '┌──────────────────▼───────────────────────┐',
              '│  Debug / admin:  ctr · crictl             │',
              '└──────────────────┬───────────────────────┘',
              '                   │ gRPC  /run/containerd/containerd.sock',
              '┌──────────────────▼───────────────────────┐',
              '│  containerd daemon (engine)              │',
              '└──────────────────────────────────────────┘',
            ],
          },
          {
            type: 'commands',
            title: 'Install + verify (includes ctr)',
            items: [
              { cmd: 'apt update && apt install -y containerd.io', note: 'Debian/Ubuntu package path' },
              { cmd: 'ctr --version', out: 'ctr github.com/containerd/containerd v1.7.13' },
              { cmd: 'which ctr', out: '/usr/bin/ctr' },
              { cmd: 'sudo ctr version', note: 'most ops need root (or proper socket ACLs)' },
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'nerdctl tip',
            body: 'For Docker-compatible daily use on bare containerd: install nerdctl. ctr stays your mechanic’s diagnostic tool.',
          },
          {
            type: 'code',
            title: 'Quick nerdctl install sketch',
            lang: 'bash',
            code: `wget https://github.com/containerd/nerdctl/releases/download/v2.0.0/nerdctl-2.0.0-linux-amd64.tar.gz
tar Cxzf /usr/local/bin nerdctl-2.0.0-linux-amd64.tar.gz
nerdctl run -d --name test nginx
nerdctl ps`,
          },
          {
            type: 'cards',
            title: "Acronyms you'll keep seeing",
            items: [
              { title: 'gRPC', body: "A high-performance RPC framework built on HTTP/2 that uses Protocol Buffers for the wire format; containerd exposes its entire API as gRPC services over the Unix socket.", tag: 'RPC', color: 'blue' },
              { title: 'protobuf', body: "Protocol Buffers: Google's binary serialization format; gRPC messages (pull requests, task events, etc.) are protobuf messages, not JSON.", tag: 'Wire', color: 'cyan' },
              { title: 'CRI', body: 'Container Runtime Interface: the gRPC API Kubernetes’ kubelet uses to talk to any compliant runtime (containerd, CRI-O) without caring which one.', tag: 'K8s', color: 'sky' },
              { title: 'CNI', body: "Container Network Interface: a plugin spec for wiring up a container's network namespace; containerd calls CNI plugins, it doesn't implement networking itself.", tag: 'Net', color: 'green' },
              { title: 'CNCF', body: 'Cloud Native Computing Foundation: the vendor-neutral body (part of the Linux Foundation) that governs containerd, Kubernetes, and other cloud-native projects after donation.', tag: 'Governance', color: 'purple' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'landscape',
    part: 'Part 1 · Foundations',
    title: 'Runtime Landscape',
    short: 'Stack',
    icon: 'Layers',
    lessons: [
      {
        id: 'landscape-layers',
        title: 'High-Level vs Low-Level vs Middle',
        blocks: [
          {
            type: 'text',
            body: 'Container runtimes sit at different abstraction levels. containerd is the middle layer: stable daemon API for high-level tools, full lifecycle + images, delegates execution to OCI runtimes.',
          },
          {
            type: 'demo',
            demoId: 'DemoRuntimeStack',
          },
          {
            type: 'demo',
            demoId: 'VisualRuntimeFlow',
          },
          {
            type: 'cards',
            title: 'Three levels',
            items: [
              {
                title: 'High-level',
                body: 'Docker Engine, Podman, LXD - CLI, build, volumes, registry UX, developer tooling',
                tag: 'UX',
                color: 'blue',
              },
              {
                title: 'Middle (containerd)',
                body: 'Stable gRPC, images, snapshots, tasks, CRI plugin, multi-tenancy namespaces',
                tag: 'Engine',
                color: 'mcb',
              },
              {
                title: 'Low-level (OCI)',
                body: 'runc / gVisor / Kata - namespaces, cgroups, seccomp, mounts, exec process',
                tag: 'OCI',
                color: 'red',
              },
            ],
          },
          {
            type: 'diagram',
            title: 'Full stack (from your architecture notes)',
            lines: [
              'USER/CLIENT: Docker CLI · kubectl · nerdctl · crictl · custom client',
              '        │ Docker API / CRI / gRPC',
              'HIGH-LEVEL: Docker Engine · kubelet · other orchestrators',
              '        │ CRI / gRPC',
              'CONTAINERD: gRPC API · CRI · Image · Container · Task · Snapshot · Content · Namespace · Runtime plugins',
              '        │ OCI Runtime Spec',
              'SHIM LAYER: containerd-shim-runc-v2 per container (stdio, exit, reaping)',
              '        │ spawn & monitor',
              'LOW-LEVEL: runc · gVisor · Kata',
              '        │',
              'KERNEL: namespaces · cgroups · caps · seccomp · AppArmor/SELinux · overlayfs',
            ],
          },
          {
            type: 'list',
            title: 'High-level focuses on',
            items: [
              'Intuitive CLIs',
              'Image building',
              'Volume & network management UX',
              'Registry integration',
              'Developer tooling',
            ],
          },
          {
            type: 'list',
            title: 'Low-level focuses on',
            items: [
              'Create Linux namespaces (process isolation)',
              'Set up cgroups (resource limits)',
              'Security policies (capabilities, seccomp, AppArmor/SELinux)',
              'Mount root filesystems',
              'Execute container processes',
            ],
          },
          {
            type: 'steps',
            kind: 'lab',
            goal: 'Given a tool name, place it at the right layer of the stack.',
            steps: [
              { title: 'Classify the high-level tools', detail: 'docker, nerdctl, and kubectl are high-level: CLI, build, developer UX - they call down to a middle layer instead of running containers themselves.' },
              { title: 'Classify the middle layer', detail: 'containerd is the middle layer: stable gRPC API, image/snapshot/task management, delegates actual process execution to an OCI runtime.' },
              { title: 'Classify the low-level runtimes', detail: 'runc, gVisor, and Kata are low-level OCI runtimes: they create namespaces/cgroups and exec the container process, then (for runc) exit.' },
              { title: 'Verify', detail: 'Place ctr itself: it is a debug/admin client that talks gRPC directly to containerd - so it sits above the middle layer as a thin client, not inside it.' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'architecture',
    part: 'Part 1 · Foundations',
    title: 'Architecture Deep Dive',
    short: 'Arch',
    icon: 'Server',
    lessons: [
      {
        id: 'arch-services',
        title: 'Internal Services',

        blocks: [
          {
            type: 'text',
            body: 'Almost everything in containerd is a plugin. Clients hit one socket; services handle one responsibility each.',
          },
          {
            type: 'demo',
            demoId: 'DemoArchitecture',
          },
          {
            type: 'cards',
            items: [
              { title: 'gRPC API Server', body: 'Listens on /run/containerd/containerd.sock for all client RPCs', tag: 'API', color: 'blue' },
              { title: 'CRI Plugin', body: 'Kubernetes Container Runtime Interface - kubelet path', tag: 'K8s', color: 'sky' },
              { title: 'Image Service', body: 'Pull/push, manifests, tags, CAS storage, metadata', tag: 'Images', color: 'green' },
              { title: 'Container Service', body: 'Metadata + config only - container ≠ running process', tag: 'Meta', color: 'cyan' },
              { title: 'Task Service', body: 'Running processes - spawn shims, kill, exec, metrics', tag: 'Run', color: 'yellow' },
              { title: 'Snapshot Service', body: 'Filesystem snapshots via overlayfs/btrfs/zfs/…', tag: 'FS', color: 'orange' },
              { title: 'Content Service', body: 'Content-addressable blobs (layers by sha256)', tag: 'CAS', color: 'pink' },
              { title: 'Namespace Service', body: 'Logical multi-tenancy: default / k8s.io / moby / custom', tag: 'Tenancy', color: 'teal' },
              { title: 'Runtime Plugin IF', body: 'runc, gVisor, Kata, Firecracker backends', tag: 'OCI', color: 'red' },
            ],
          },
          {
            type: 'commands',
            title: 'List plugins',
            items: [
              {
                cmd: 'sudo ctr plugins list',
                out: `TYPE                            ID           PLATFORMS     STATUS
io.containerd.snapshotter.v1    overlayfs    linux/amd64   ok
io.containerd.runtime.v2        runc         linux/amd64   ok
io.containerd.grpc.v1           cri          linux/amd64   ok`,
              },
              { cmd: 'sudo ctr plugins list | grep cri', note: 'filter CRI plugin status' },
            ],
          },
          {
            type: 'steps',
            kind: 'lab',
            goal: 'List the internal services containerd exposes as plugins.',
            steps: [
              { title: 'List all plugins', detail: 'Every internal service (gRPC API, CRI, image, container, task, snapshot, content, namespace, runtime) is registered as a plugin.', cmd: 'sudo ctr plugins list' },
              { title: 'Find the CRI plugin', detail: 'This is the path kubelet uses - it must report ok for Kubernetes to schedule pods on this node.', cmd: 'sudo ctr plugins list | grep cri' },
              { title: 'Find the snapshotter plugin', detail: 'Confirms which filesystem backend (overlayfs, btrfs, zfs, …) is active.', cmd: 'sudo ctr plugins list | grep snapshotter' },
              { title: 'Verify', detail: 'Every plugin line should read STATUS: ok - anything else means that service failed to initialize.', cmd: 'sudo ctr plugins list | grep -v ok' },
            ],
          },
        ],
      },
      {
        id: 'arch-shim',
        title: 'containerd-shim: Key Innovation',

        blocks: [
          {
            type: 'demo',
            demoId: 'DemoShim',
          },
          {
            type: 'demo',
            demoId: 'VisualShimSurvival',
          },
          {
            type: 'callout',
            variant: 'warn',
            title: 'Problem',
            body: 'If the daemon owned containers directly, restarting containerd would kill every workload. Unacceptable in production.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Solution',
            body: 'Per-container shim (containerd-shim-runc-v2): owns stdio FDs, exit code, PID file, reaps zombies, keeps the process alive across daemon restarts.',
          },
          {
            type: 'diagram',
            title: 'Process tree',
            lines: [
              'systemd (PID 1)',
              ' └─ containerd',
              '     ├─ containerd-shim-runc-v2  →  nginx (PID 1 in netns)',
              '     ├─ containerd-shim-runc-v2  →  postgres',
              '     └─ containerd-shim-runc-v2  →  python app',
            ],
          },
          {
            type: 'list',
            title: 'Shim responsibilities',
            items: [
              'Stdio handling (stdin/stdout/stderr streams)',
              'Capture and report exit status',
              'Reap zombie processes',
              'TTY management for interactive containers',
              'Decouple daemon lifecycle from container lifecycle',
            ],
          },
          {
            type: 'commands',
            title: 'Prove survival across restart',
            items: [
              { cmd: 'nerdctl run -d --name test nginx' },
              { cmd: 'ps aux | grep containerd', note: 'see daemon + shim-runc-v2 lines' },
              { cmd: 'systemctl restart containerd' },
              { cmd: 'nerdctl ps', note: 'container "test" still running - shim kept it alive' },
            ],
          },
          {
            type: 'tree',
            title: 'Runtime state paths',
            lines: [
              '/run/containerd/io.containerd.runtime.v2.task/',
              '└── <namespace>/',
              '    └── <container-id>/',
              '        ├── config.json   # OCI runtime spec',
              '        ├── init.pid',
              '        ├── log.json',
              '        └── rootfs/      # if bundle mode',
            ],
          },
          {
            type: 'steps',
            kind: 'lab',
            goal: 'Find the containerd-shim process backing a running task.',
            steps: [
              { title: 'Start a task', detail: 'Get a real container process running so it has a shim.', cmd: 'nerdctl run -d --name test nginx' },
              { title: 'Find the shim in the process tree', detail: 'containerd-shim-runc-v2 sits between containerd and the container init process.', cmd: 'ps --forest -o pid,ppid,cmd -g $(pgrep containerd | head -1)' },
              { title: 'Note it stays attached to the socket', detail: 'The shim - not the daemon - owns stdio, exit code, and reaping for this container.', cmd: 'ps aux | grep containerd-shim' },
              { title: 'Restart the daemon', detail: 'Restarting containerd should not kill the workload if the shim is doing its job.', cmd: 'systemctl restart containerd' },
              { title: 'Verify', detail: 'The container is still running - the shim PID survived the daemon restart untouched.', cmd: 'nerdctl ps' },
            ],
          },
        ],
      },
      {
        id: 'arch-namespaces',
        title: 'containerd Namespaces (Multi-Tenancy)',
        blocks: [
          {
            type: 'callout',
            variant: 'info',
            title: 'Not Linux namespaces',
            body: 'containerd namespaces are logical resource partitions (images, containers, tasks, snapshots). Linux namespaces (pid/net/mnt/…) are created by runc for each container.',
          },
          {
            type: 'demo',
            demoId: 'VisualNamespaces',
          },
          {
            type: 'commands',
            title: 'Namespace ops',
            items: [
              { cmd: 'sudo ctr namespaces list', note: 'common: default, k8s.io (Kubernetes), moby (Docker)' },
              { cmd: 'sudo ctr namespaces create production' },
              { cmd: 'sudo ctr namespaces create staging' },
              { cmd: 'sudo ctr namespaces create development' },
              { cmd: 'sudo ctr namespaces create production --label env=prod' },
              { cmd: 'sudo ctr namespaces get production' },
              { cmd: 'sudo ctr namespaces label production team=backend' },
              { cmd: 'sudo ctr --namespace=production images pull docker.io/library/nginx:1.24' },
              { cmd: 'sudo ctr -n staging images pull docker.io/library/nginx:1.25' },
              { cmd: 'sudo ctr --namespace=production containers list' },
              { cmd: 'sudo ctr namespaces remove my-namespace', note: 'must be empty' },
              { cmd: 'sudo ctr namespaces remove --force my-namespace', note: 'dangerous' },
            ],
          },
          {
            type: 'list',
            title: 'Why it matters',
            items: [
              'Multiple K8s clusters / tenants on one host',
              'Dev / staging / prod isolation',
              'Team isolation and accounting',
              'Docker (moby) and K8s (k8s.io) never collide resources',
            ],
          },
          {
            type: 'cards',
            title: "Linux kernel namespaces (the OS mechanism, not containerd's)",
            items: [
              { title: 'PID', body: 'A process sees only its own process tree - it can be PID 1 inside the container while being a normal PID on the host.', tag: 'Kernel', color: 'red' },
              { title: 'NET', body: 'A private set of network interfaces, IPs, routes, and ports - separate from the host network stack.', tag: 'Kernel', color: 'red' },
              { title: 'MNT', body: 'A private view of mount points, so the container root filesystem doesn’t leak host mounts (or vice versa).', tag: 'Kernel', color: 'red' },
              { title: 'UTS', body: 'A private hostname and domain name, independent of the host’s.', tag: 'Kernel', color: 'red' },
              { title: 'IPC', body: 'Isolated System V IPC and POSIX message queues - one container can’t see another’s shared memory segments.', tag: 'Kernel', color: 'red' },
              { title: 'USER', body: 'Maps UID/GID inside the container to different (often unprivileged) IDs on the host - the basis for rootless containers.', tag: 'Kernel', color: 'red' },
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Two different "namespace" words',
            body: 'These 6 kernel namespaces are created by runc per container to isolate a resource view. containerd namespaces (default/k8s.io/moby, above) are a completely separate, higher-level concept: logical partitions of containerd’s own metadata. Same word, two unrelated mechanisms.',
          },
          {
            type: 'steps',
            kind: 'lab',
            goal: 'Create and use a custom containerd namespace end to end.',
            steps: [
              { title: 'Create the namespace', detail: 'This is a containerd (logical) namespace, not a Linux kernel one.', cmd: 'sudo ctr namespaces create demo' },
              { title: 'Pull an image into it', detail: 'Every operation must be explicitly scoped with -n/--namespace.', cmd: 'sudo ctr -n demo images pull docker.io/library/nginx:latest' },
              { title: 'Run a container scoped to it', detail: 'The container only exists inside the demo namespace.', cmd: 'sudo ctr -n demo run -d docker.io/library/nginx:latest demo-nginx' },
              { title: 'Check the default namespace', detail: 'The container should be invisible here - namespaces isolate containerd metadata.', cmd: 'sudo ctr -n default containers list' },
              { title: 'Verify', detail: 'demo-nginx appears in the demo namespace listing but not in default - proving the isolation.', cmd: 'sudo ctr -n demo containers list' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'internals',
    part: 'Part 1 · Foundations',
    title: 'How It Works Internally',
    short: 'Lifecycle',
    icon: 'Zap',
    lessons: [
      {
        id: 'life-pull',
        title: 'Phase 1 - Image Pull',

        blocks: [
          {
            type: 'demo',
            demoId: 'DemoImagePull',
          },
          {
            type: 'commands',
            items: [{ cmd: 'nerdctl pull nginx:latest', note: 'user-facing; same path under the hood as ctr images pull' }],
          },
          {
            type: 'steps',
            title: 'Internal flow',
            steps: [
              { title: 'Client request', detail: 'nerdctl/ctr sends gRPC Pull to containerd' },
              { title: 'Image service', detail: 'handles resolve + fetch pipeline' },
              { title: 'Registry resolution', detail: 'nginx:latest → docker.io/library/nginx:latest' },
              { title: 'Manifest fetch', detail: 'JSON describing layers + config' },
              { title: 'Layer download', detail: 'layers downloaded in parallel' },
              { title: 'Content store', detail: 'blobs under /var/lib/containerd/io.containerd.content.v1.content/' },
              { title: 'Unpack snapshot', detail: 'snapshotter builds filesystem snapshot from layers' },
              { title: 'Metadata update', detail: 'BoltDB meta.db records image refs' },
            ],
          },
          {
            type: 'tree',
            title: 'On-disk after pull',
            lines: [
              '/var/lib/containerd/',
              '├── io.containerd.content.v1.content/',
              '│   ├── blobs/sha256/{abc…, def…, ghi…}',
              '│   └── ingest/  (temp downloads)',
              '├── io.containerd.snapshotter.v1.overlayfs/snapshots/',
              '└── io.containerd.metadata.v1.bolt/meta.db',
            ],
          },
          {
            type: 'commands',
            title: 'ctr equivalent',
            items: [
              { cmd: 'sudo ctr images pull docker.io/library/nginx:latest', note: 'full reference required - no Docker shorthand' },
              { cmd: 'sudo ctr images list' },
              { cmd: 'sudo ctr content list', note: 'raw CAS blobs' },
            ],
          },
          {
            type: 'steps',
            kind: 'lab',
            goal: 'Pull an image and see exactly where its layers land in the content store.',
            steps: [
              { title: 'Pull a small image', detail: 'Alpine is small enough to inspect quickly.', cmd: 'sudo ctr images pull docker.io/library/alpine:latest' },
              { title: 'List the content blobs', detail: 'Every layer + config + manifest is stored as a sha256-addressed blob.', cmd: 'sudo ctr content list' },
              { title: 'Pick one digest and find it on disk', detail: 'The digest is literally the directory path under the content store.', cmd: 'ls /var/lib/containerd/io.containerd.content.v1.content/blobs/sha256/' },
              { title: 'Verify', detail: 'Grab any digest ctr content list printed and confirm it matches a filename in that directory - proving CAS storage is exactly "path = hash of contents".', cmd: 'sudo ctr content list | head -1' },
            ],
          },
        ],
      },
      {
        id: 'life-create',
        title: 'Phase 2 - Container Create',
        blocks: [
          {
            type: 'demo',
            demoId: 'DemoLifecycle',
          },
          {
            type: 'demo',
            demoId: 'VisualContainerLifecycle',
          },
          {
            type: 'commands',
            items: [{ cmd: 'nerdctl run -d --name web -p 8080:80 nginx:latest' }],
          },
          {
            type: 'steps',
            steps: [
              { title: 'Parse args', detail: 'ports, name, env, mounts' },
              { title: 'Create container object', detail: 'metadata only - process not started yet' },
              { title: 'Writable snapshot', detail: 'active snapshot on top of image snapshot (COW)' },
              { title: 'Store metadata', detail: 'ID, image, snapshot key, labels, OCI-ish spec' },
              { title: 'Network setup', detail: 'CNI plugins create network namespace / interfaces' },
              { title: 'Assign ID', detail: 'unique container id' },
            ],
          },
          {
            type: 'code',
            title: 'Container object (conceptual)',
            lang: 'json',
            code: `{
  "id": "abc123def456",
  "image": "docker.io/library/nginx:latest",
  "snapshots": { "rootfs": "overlay-xyz789" },
  "spec": {
    "process": {
      "args": ["nginx", "-g", "daemon off;"],
      "env": ["PATH=/usr/local/sbin:/usr/local/bin:..."]
    },
    "mounts": [...],
    "linux": { "namespaces": [...] }
  }
}`,
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Container vs Task',
            body: 'In containerd, create = metadata. Start task = live process with PID. Docker collapses these; containerd keeps them separate on purpose.',
          },
          {
            type: 'steps',
            kind: 'lab',
            goal: 'Create a container and inspect its metadata without starting it.',
            steps: [
              { title: 'Create the container', detail: 'This only writes metadata - no process runs yet.', cmd: 'sudo ctr containers create docker.io/library/nginx:latest lab-web' },
              { title: 'Inspect it', detail: 'Shows the container object: image ref, snapshot key, spec - but no PID field.', cmd: 'sudo ctr containers info lab-web' },
              { title: 'Check for a task', detail: 'Confirms there is no running process attached yet.', cmd: 'sudo ctr tasks list' },
              { title: 'Verify', detail: 'lab-web should be absent from the task list - proof that "create" produced metadata only, matching the Container vs Task distinction above.', cmd: 'sudo ctr tasks list | grep lab-web || echo "no task - as expected"' },
            ],
          },
        ],
      },
      {
        id: 'life-start',
        title: 'Phase 3 - Task Start',
        blocks: [
          {
            type: 'demo',
            demoId: 'VisualTaskStart',
          },
          {
            type: 'steps',
            title: 'Start pipeline',
            steps: [
              { title: 'Task service', detail: 'owns execution path' },
              { title: 'Spawn shim', detail: 'containerd-shim-runc-v2 for this container' },
              { title: 'OCI spec', detail: 'generate config.json (namespaces, mounts, caps, seccomp)' },
              { title: 'Shim → runc', detail: 'shim invokes low-level runtime' },
              { title: 'Linux namespaces', detail: 'PID, NET, MNT, UTS, IPC, USER' },
              { title: 'cgroups', detail: 'CPU/memory/IO limits' },
              { title: 'Security', detail: 'capabilities, seccomp, AppArmor/SELinux' },
              { title: 'Rootfs mount', detail: 'overlay merged view as container /' },
              { title: 'Exec init', detail: 'container PID 1 (e.g. nginx)' },
            ],
          },
          {
            type: 'diagram',
            title: 'Process tree after start',
            lines: [
              'systemd (PID 1)',
              ' └─ containerd (PID 1234)',
              '     └─ containerd-shim-runc-v2 (PID 5678)',
              '         └─ nginx (PID 1 in container = PID 5679 on host)',
              '             ├─ nginx worker 1',
              '             └─ nginx worker 2',
            ],
          },
          {
            type: 'commands',
            title: 'Inspect host namespaces of the process',
            items: [
              {
                cmd: 'ls -la /proc/5679/ns/',
                out: `pid -> 'pid:[4026532555]'
net -> 'net:[4026532558]'
mnt -> 'mnt:[4026532556]'
uts -> 'uts:[4026532557]'`,
              },
            ],
          },
          {
            type: 'steps',
            kind: 'lab',
            goal: "Start a task and trace its process tree down to the container's PID 1.",
            steps: [
              { title: 'Start the task', detail: 'Launch a container so it has a real host PID.', cmd: 'sudo ctr run -d docker.io/library/nginx:latest lab-start' },
              { title: 'Get the PID', detail: 'tasks list reports the host-side PID of the container init process.', cmd: 'sudo ctr tasks list' },
              { title: 'Trace the process tree', detail: 'Walk up from that PID to confirm containerd-shim-runc-v2 is its parent, not containerd itself.', cmd: 'ps --forest -o pid,ppid,cmd' },
              { title: 'Verify', detail: 'The PID from tasks list should have its own PID/NET/MNT/UTS namespaces, distinct from the host - confirming runc actually isolated it.', cmd: 'ls -la /proc/<pid>/ns/' },
            ],
          },
        ],
      },
      {
        id: 'life-ops-stop',
        title: 'Phase 4–6 - Monitor, Stop, Remove',
        blocks: [
          {
            type: 'list',
            title: 'While running',
            items: [
              'Shim monitors the process',
              'Health checks (if configured)',
              'Metrics via cgroups',
              'Log streaming of stdout/stderr',
              'gRPC API remains available',
            ],
          },
          {
            type: 'commands',
            title: 'Operate on a running container (nerdctl)',
            items: [
              { cmd: 'nerdctl exec -it web bash' },
              { cmd: 'nerdctl logs web' },
              { cmd: 'nerdctl stats web' },
            ],
          },
          {
            type: 'steps',
            title: 'Stop (nerdctl stop web)',
            steps: [
              { title: 'Stop request', detail: 'task service receives stop' },
              { title: 'SIGTERM', detail: 'graceful signal to init process' },
              { title: 'Grace period', detail: 'default ~10s' },
              { title: 'SIGKILL', detail: 'if still alive' },
              { title: 'Cleanup', detail: 'shim cleans process; network ns removed; state = stopped' },
            ],
          },
          {
            type: 'steps',
            title: 'Remove (nerdctl rm web)',
            steps: [
              { title: 'Verify stopped', detail: 'refuse delete if task still running (unless force)' },
              { title: 'Delete writable snapshot', detail: 'container upper layer gone' },
              { title: 'Metadata cleanup', detail: 'container record removed' },
              { title: 'Shim exits', detail: 'no more process to supervise' },
            ],
          },
          {
            type: 'commands',
            title: 'ctr ordered cleanup (critical order)',
            items: [
              { cmd: 'sudo ctr tasks kill web' },
              { cmd: 'sudo ctr tasks delete web' },
              { cmd: 'sudo ctr containers remove web' },
              { cmd: 'sudo ctr images rm docker.io/library/nginx:latest', note: 'optional image cleanup' },
            ],
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Order matters',
            body: 'Always: kill task → delete task → remove container. Wrong order = containerd errors. Docker hides this; ctr makes it explicit.',
          },
          {
            type: 'steps',
            kind: 'lab',
            goal: 'Cleanly stop and remove a task and its container.',
            steps: [
              { title: 'Start something to clean up', detail: 'Give yourself a running task to tear down.', cmd: 'sudo ctr run -d docker.io/library/nginx:latest lab-cleanup' },
              { title: 'Kill the task', detail: 'Sends SIGTERM (then SIGKILL after the grace period) to the init process.', cmd: 'sudo ctr tasks kill lab-cleanup' },
              { title: 'Delete the task', detail: 'Removes the task object once the process has exited.', cmd: 'sudo ctr tasks delete lab-cleanup' },
              { title: 'Remove the container', detail: 'Removes the container metadata and its writable snapshot.', cmd: 'sudo ctr containers remove lab-cleanup' },
              { title: 'Verify', detail: 'Both listings should come back empty for lab-cleanup - everything was torn down in the correct order.', cmd: 'sudo ctr containers list; sudo ctr tasks list' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'history',
    part: 'Part 1 · Foundations',
    title: 'History & Evolution',
    short: 'History',
    icon: 'Clock',
    lessons: [
      {
        id: 'history-timeline',
        title: 'From Docker Monolith to Industry Standard',
        blocks: [
          {
            type: 'steps',
            steps: [
              { title: '2013 - Docker born', detail: 'Monolithic: build, ship, run, net, volumes, Swarm' },
              { title: '2015 - Modularization', detail: 'Tight coupling hurts maintenance, integration, resource use' },
              { title: '2016 - containerd extracted', detail: 'Focus: run containers well; OCI; embeddable' },
              { title: '2017 - CNCF donation', detail: 'Neutral governance; industry collaboration' },
              { title: '2017–18 - CRI plugin', detail: 'kubelet → CRI → containerd → runc; ~30% faster pods, ~50% less mem vs dockershim path' },
              { title: '2019 - CNCF graduated', detail: 'Highest maturity; production-ready at scale' },
              { title: '2020–22 - dockershim removed', detail: 'K8s 1.24 drops Docker-as-runtime shim; containerd recommended' },
              { title: '2023+ - Modern era', detail: '75%+ K8s share; encryption, stargz lazy pull, multi-runtime, security hardening' },
            ],
          },
          {
            type: 'compare',
            title: 'Path simplification',
            left: {
              title: 'Before (dockershim)',
              items: ['K8s → dockershim → Docker Engine → containerd → runc', 'Extra hop, more memory', 'Shim maintained by K8s team'],
            },
            right: {
              title: 'After (CRI direct)',
              items: ['K8s → CRI plugin → containerd → runc', 'Faster pod startup', 'Simpler, more reliable'],
            },
          },
          {
            type: 'list',
            title: 'What left Docker vs what went to containerd',
            items: [
              'Extracted: execution, image pull/push, storage, snapshots, net ns hooks',
              'Remained in Docker: CLI, build (BuildKit later split), Compose, Swarm, DX APIs',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'compare',
    part: 'Part 1 · Foundations',
    title: 'ContainerD vs Others',
    short: 'Compare',
    icon: 'GitBranch',
    lessons: [
      {
        id: 'vs-docker',
        title: 'vs Docker Engine',
        blocks: [
          {
            type: 'table',
            headers: ['Aspect', 'Docker Engine', 'ContainerD'],
            rows: [
              ['What it is', 'Complete platform', 'Core runtime'],
              ['Users', 'Developers / DevOps', 'Platforms / orchestrators'],
              ['Binary size', '~100 MB', '~30 MB'],
              ['Memory idle', '~150 MB', '~30 MB'],
              ['Startup', '2–3 s', '<1 s'],
              ['Container launch', '~800 ms', '~500 ms'],
              ['CLI', 'Rich docker', 'Basic ctr (debug)'],
              ['Image build', 'Built-in', 'Separate (BuildKit)'],
              ['Compose', 'Yes', 'nerdctl compose'],
              ['Best for', 'Dev & learning', 'Prod & Kubernetes'],
              ['Architecture', 'Docker → containerd → runc', 'containerd → runc'],
            ],
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Fun fact',
            body: 'Docker Engine uses containerd internally. Path: Docker CLI → Docker Engine → containerd → runc.',
          },
        ],
      },
      {
        id: 'vs-crio-runc',
        title: 'vs CRI-O & vs runc',
        blocks: [
          {
            type: 'compare',
            left: {
              title: 'CRI-O',
              items: ['Kubernetes-only runtime', '~50K LOC (simpler)', 'Red Hat / OpenShift ecosystem', '~20% of K8s clusters', 'Linux only', 'Native CRI'],
            },
            right: {
              title: 'ContainerD',
              items: ['General-purpose runtime', '~100K LOC full-featured', 'Docker + K8s + custom', '~75% of K8s clusters', 'Linux + Windows', 'CRI via plugin'],
            },
          },
          {
            type: 'text',
            title: 'runc is not a competitor',
            body: 'runc is a component. containerd uses runc (or another OCI runtime). runc creates namespaces/cgroups, starts the process, then typically exits - the shim stays.',
          },
          {
            type: 'code',
            title: 'Low-level runc-only sketch (educational)',
            lang: 'bash',
            code: `# Prepare OCI bundle directory with rootfs + config.json
mkdir -p /mycontainer/rootfs
# ... extract image fs into rootfs ...
cd /mycontainer && runc spec
# edit config.json
runc run mycontainer`,
          },
          {
            type: 'steps',
            kind: 'lab',
            goal: 'Confirm runc is the low-level runtime underneath your containerd tasks, not a competing tool.',
            steps: [
              { title: 'Start a task through containerd', detail: 'Use the normal high-level path - containerd delegates execution to runc under the hood.', cmd: 'sudo ctr run -d docker.io/library/nginx:latest lab-runc' },
              { title: 'Get the containerd-side ID', detail: 'This is the ID containerd knows the task by.', cmd: 'sudo ctr tasks list' },
              { title: 'List the same container at the runc level', detail: 'runc keeps its own state directory per runtime namespace - this shows the exact same container from underneath containerd.', cmd: 'sudo runc --root /run/containerd/runc/default list' },
              { title: 'Verify', detail: 'The container ID and state (running) shown by runc list should match ctr tasks list exactly - proof containerd delegates to runc rather than replacing it.', cmd: 'sudo runc --root /run/containerd/runc/default state lab-runc' },
            ],
          },
        ],
      },
    ],
  },
];
