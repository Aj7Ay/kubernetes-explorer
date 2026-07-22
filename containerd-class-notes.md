# CONTAINERD MASTERCLASS
## Teaching Notes: Part 1 · Foundations

---

## THE BIG QUESTION

**Say this:**

"Here's what everyone gets wrong. Your Docker Desktop is running containers, right? But actually... it's not really Docker doing the heavy lifting. Underneath that nice steering wheel and dashboard, there's an engine. A really good engine. That engine is containerd."

**Wait, what?**

"You've been using containerd the whole time. When you `docker run nginx`, Docker talks to containerd. When Kubernetes runs your pods, the kubelet talks to containerd. When you use `nerdctl` on a Linux server, you're talking straight to containerd."

**The plot twist:**

"Docker is actually a fancy wrapper around containerd. Docker Engine is: CLI + build + volumes + networks + ... and then it delegates the hard stuff to containerd. The container execution? The image storage? The low-level lifecycle management? That's all containerd."

**The real question we're answering today:**

"If Docker is just a wrapper, what exactly is containerd doing? And why does everyone in infrastructure care about it so much? Why did Kubernetes dump Docker years ago and bet everything on containerd's CRI plugin?"

---

## PART 1 · FOUNDATIONS

---

### Module: What is ContainerD (`intro`)

#### Lesson: The Engine Room (`intro-engine`)

**Say this as your opener:**

"Think of containerD like this. Docker is your car's steering wheel, dashboard, and button panel. It's got style. But containerd? Containerd is the engine. That's where the actual work happens."

**The Definition (read this seriously):**

> ContainerD (pronounced "container-dee") is an industry-standard core container runtime that manages the complete container lifecycle on a host: image transfer and storage, container execution and supervision, low-level storage, and network attachments.

**Callout - Car Analogy (variant: tip):**

Say: "Here's how to think about the relationship:"

> Docker is the steering wheel and dashboard. containerd is the engine. Whether you use Docker, Kubernetes, or nerdctl - containerd is usually doing the heavy lifting.

**[DEMO] VisualCarAnalogy** - Show the visual representation of this metaphor

**[DEMO] DemoEngineIntro** - Live walkthrough of what containerd does

**What containerd actually does (Cards - 6 items):**

Say: "Let me break down the six main responsibilities:"

1. **Image management** (Tag: Images, Color: blue)
   - Body: "Pull/push, content-addressable storage, layer dedup, metadata"
   - Say: "When you pull an image, containerd handles downloading layers, storing them efficiently, deduplicating identical layers across different images, and keeping metadata about what you've pulled."

2. **Lifecycle** (Tag: Tasks, Color: green)
   - Body: "Create, start, monitor, stop, remove containers and tasks"
   - Say: "Containerd manages the entire container lifecycle. From the moment you say 'create this container' to the moment it's completely removed from the system. It's watching everything."

3. **Snapshots** (Tag: Storage, Color: orange)
   - Body: "overlayfs / btrfs / zfs / stargz snapshotter plugins"
   - Say: "The magic of containers is that you can have dozens of containers all sharing the same base image but with their own isolated filesystem. Snapshots make that work. Containerd supports multiple snapshotter backends - overlayfs is the default on Linux, but you can swap in others."

4. **Networking hooks** (Tag: CNI, Color: sky)
   - Body: "CNI integration, network namespace setup (not full Docker networks)"
   - Say: "Containerd sets up the network namespace for each container. It integrates with CNI - the Container Networking Interface. But note: it doesn't do the fancy Docker network management. That's higher level."

5. **CRI plugin** (Tag: K8s, Color: mcb)
   - Body: "Kubernetes talks to containerd via CRI over gRPC"
   - Say: "This is why Kubernetes loves containerd. The CRI plugin is a standard interface that any orchestrator can talk to. Kubernetes uses this to manage your pods."

6. **Multi-runtime** (Tag: Runtime, Color: yellow)
   - Body: "runc (default), gVisor, Kata, Firecracker via OCI plugins"
   - Say: "You're not locked into one runtime. Containerd ships with runc, but you can plug in gVisor for extra isolation, Kata for VMs-as-containers, Firecracker for lightweight VMs. Different containers, different runtimes."

**Is containerd running? Let's check (Commands - 3):**

Say: "Let's verify containerd is actually running on your system right now:"

1. Command: `systemctl status containerd`
   - Note: "systemd service status"
   - Say: "If you see 'active (running)', you're good. This is how systemd supervises the daemon."

2. Command: `ls -l /run/containerd/containerd.sock`
   - Note: "gRPC API socket clients talk to"
   - Output: `srwxr-xr-x 1 root root 0 /run/containerd/containerd.sock`
   - Say: "See that 's' at the beginning? That's a socket. This is the Unix domain socket. All the gRPC traffic goes through here. Clients connect to this socket to talk to the daemon."

3. Command: `ctr version`
   - Note: "client + server versions"
   - Say: "This tells you the version of the client tool (ctr) and the version of the server (containerd daemon). They should be compatible."

**What containerd is NOT (Checklist - 4 items):**

Say: "Before we go further, let's clear up the most common misconceptions:"

1. Checkbox (ok: false): "No friendly daily CLI (ctr is for debug; use nerdctl/docker for DX)"
   - Say: "The `ctr` command is NOT meant for daily use. It's verbose, it's for debugging, it's a mechanic's diagnostic tool. If you want a nice Docker-like experience on bare containerd, use nerdctl."

2. Checkbox (ok: false): "No image building (use BuildKit / docker build / nerdctl build)"
   - Say: "Containerd does NOT build images. That's a higher-level responsibility. You use Docker, nerdctl, or BuildKit for that."

3. Checkbox (ok: false): "No multi-host orchestration (use Kubernetes)"
   - Say: "Containerd runs on one host. It doesn't know about your other servers. That's Kubernetes's job."

4. Checkbox (ok: false): "No Docker-like high-level network/volume UX"
   - Say: "You don't get `docker network create my-net` or `docker volume create` with containerd. Containerd does the low-level namespace setup, but the high-level UX is someone else's job."

#### [LAB] Confirm containerd is installed and running

**Goal:** Confirm containerd is installed and running on this host.

1. Check the systemd service is active: `systemctl status containerd`
2. Check the gRPC socket exists - if it's there, the daemon is listening: `ls -l /run/containerd/containerd.sock`
3. Query the daemon directly for its version over that socket: `ctr version`
4. **Verify:** re-run `ctr version` - success means both a `Client` and a `Server` version print, proving the daemon actually answered.

Say: "This is now flagged as a hands-on lab in the app - don't just take my word that containerd is running. Prove it yourself."

---

#### Lesson: Daemon, Socket & Clients (`intro-daemon`)

**Say this:**

"Containerd is a daemon. Like most daemons, it runs in the background and listens for clients. Let's talk about the architecture."

**The text block:**

> containerd runs as a system daemon and listens on a Unix socket. Clients (Docker Engine, kubelet CRI, nerdctl, ctr, custom Go clients) speak gRPC to that socket.

**Diagram - Client stack:**

```
┌─ User-friendly ──────────────────────────┐
│  docker · nerdctl · kubectl               │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│  Debug / admin:  ctr · crictl             │
└──────────────────┬───────────────────────┘
                   │ gRPC  /run/containerd/containerd.sock
┌──────────────────▼───────────────────────┐
│  containerd daemon (engine)              │
└──────────────────────────────────────────┘
```

Say: "At the bottom, the daemon. All the way at the top, the tools you use. In the middle, the socket. Everything goes through gRPC."

**Install + verify (Commands - 4):**

Say: "Let's get containerd running from scratch:"

1. Command: `apt update && apt install -y containerd.io`
   - Note: "Debian/Ubuntu package path"
   - Say: "One command. The containerd.io package includes the daemon, the ctr tool, and all the default runtimes and snapshotters."

2. Command: `ctr --version`
   - Output: `ctr github.com/containerd/containerd v1.7.13`
   - Say: "You've got the client tool. Version 1.7.13 in this example."

3. Command: `which ctr`
   - Output: `/usr/bin/ctr`
   - Say: "It's in your PATH. You can run it from anywhere."

4. Command: `sudo ctr version`
   - Note: "most ops need root (or proper socket ACLs)"
   - Say: "Notice the `sudo`. Most operations on the socket need root privilege because it's owned by root. You can change this with socket ACLs if you want to run containers as a non-root user."

**Callout - nerdctl tip (variant: info):**

Say: "Now here's the pro tip:"

> For Docker-compatible daily use on bare containerd: install nerdctl. ctr stays your mechanic's diagnostic tool.

Say: "If you're running containerd on a Linux server without Docker, nerdctl is your answer. It gives you `docker`-like commands. But ctr? That's for when things go wrong and you need to debug."

**Code block - Quick nerdctl install sketch:**

Say: "Here's how to get nerdctl up and running:"

```bash
wget https://github.com/containerd/nerdctl/releases/download/v2.0.0/nerdctl-2.0.0-linux-amd64.tar.gz
tar Cxzf /usr/local/bin nerdctl-2.0.0-linux-amd64.tar.gz
nerdctl run -d --name test nginx
nerdctl ps
```

Say: "Download the binary, extract it to `/usr/local/bin`, and boom - you can run containers like you're using Docker. That last `nerdctl ps` will list your running containers."

#### Cards: Acronyms You'll Keep Seeing

Say: "Before we go any further, let's nail down the alphabet soup you'll hear for the rest of this course. I'll use these words constantly, so let's define them once, properly:"

1. **gRPC** (Tag: RPC, Color: blue)
   - "A high-performance RPC framework built on HTTP/2 that uses Protocol Buffers for the wire format. containerd exposes its *entire* API as gRPC services over that Unix socket we just looked at."
2. **protobuf** (Tag: Wire, Color: cyan)
   - "Protocol Buffers - Google's binary serialization format. Every gRPC message (a pull request, a task event, whatever) is a protobuf message on the wire, not JSON. That's part of why it's fast."
3. **CRI** (Tag: K8s, Color: sky)
   - "Container Runtime Interface - the gRPC API Kubernetes' kubelet uses to talk to any compliant runtime, containerd or CRI-O, without caring which one it's actually talking to."
4. **CNI** (Tag: Net, Color: green)
   - "Container Network Interface - a plugin spec for wiring up a container's network namespace. containerd *calls* CNI plugins; it doesn't implement networking itself."
5. **CNCF** (Tag: Governance, Color: purple)
   - "Cloud Native Computing Foundation - the vendor-neutral body, part of the Linux Foundation, that governs containerd, Kubernetes, and the other cloud-native projects after they're donated."

Say: "Keep these five in your back pocket. Every time I say gRPC, CRI, CNI, or CNCF for the rest of the course, you'll know exactly what I mean."

---

### Module: Runtime Landscape (`landscape`)

#### Lesson: High-Level vs Low-Level vs Middle (`landscape-layers`)

**Say this:**

"Now we need to zoom out. Containerd isn't the only runtime. Let's talk about the landscape. There are three levels, and containerd is the glue in the middle."

**The text block:**

> Container runtimes sit at different abstraction levels. containerd is the middle layer: stable daemon API for high-level tools, full lifecycle + images, delegates execution to OCI runtimes.

**[DEMO] DemoRuntimeStack** - Visual representation of the three-tier model

**[DEMO] VisualRuntimeFlow** - See the flow of a request through all the layers

**Three levels (Cards - 3 items):**

Say: "Let me describe each level:"

1. **High-level** (Tag: UX, Color: blue)
   - Body: "Docker Engine, Podman, LXD - CLI, build, volumes, registry UX, developer tooling"
   - Say: "This is where you live. Nice CLIs, image building, volume management, network management. The user experience layer."

2. **Middle (containerd)** (Tag: Engine, Color: mcb)
   - Body: "Stable gRPC, images, snapshots, tasks, CRI plugin, multi-tenancy namespaces"
   - Say: "Stable API. Images. Snapshots. Tasks. This is the engine. No user experience, but rock-solid infrastructure."

3. **Low-level (OCI)** (Tag: OCI, Color: red)
   - Body: "runc / gVisor / Kata - namespaces, cgroups, seccomp, mounts, exec process"
   - Say: "The actual execution. Creating Linux namespaces, setting up cgroups, mounting filesystems, executing the process. The lowest level before the kernel."

**Full stack diagram (ALL lines from source):**

Say: "Here's the complete view from your fingers to the kernel:"

```
USER/CLIENT: Docker CLI · kubectl · nerdctl · crictl · custom client
        │ Docker API / CRI / gRPC
HIGH-LEVEL: Docker Engine · kubelet · other orchestrators
        │ CRI / gRPC
CONTAINERD: gRPC API · CRI · Image · Container · Task · Snapshot · Content · Namespace · Runtime plugins
        │ OCI Runtime Spec
SHIM LAYER: containerd-shim-runc-v2 per container (stdio, exit, reaping)
        │ spawn & monitor
LOW-LEVEL: runc · gVisor · Kata
        │
KERNEL: namespaces · cgroups · caps · seccomp · AppArmor/SELinux · overlayfs
```

Say: "Every single layer has a job. Every layer talks to the layer below it. This is modular architecture at its finest."

**High-level focuses on (List - 5 items):**

Say: "If you're building high-level tools, you care about:"

- Intuitive CLIs
- Image building
- Volume & network management UX
- Registry integration
- Developer tooling

Say: "This is what makes development easy. This is what the `docker` command gives you."

**Low-level focuses on (List - 5 items):**

Say: "If you're doing low-level work (which runc does), you care about:"

- Create Linux namespaces (process isolation)
- Set up cgroups (resource limits)
- Security policies (capabilities, seccomp, AppArmor/SELinux)
- Mount root filesystems
- Execute container processes

Say: "This is the raw mechanics. This is what keeps containers isolated from each other and from the host."

#### [LAB] Place a tool at the right layer

**Goal:** Given a tool name, place it at the right layer of the stack.

1. Classify the high-level tools: docker, nerdctl, and kubectl are high-level - CLI, build, developer UX - they call down to a middle layer instead of running containers themselves.
2. Classify the middle layer: containerd is the middle layer - stable gRPC API, image/snapshot/task management, delegates actual process execution to an OCI runtime.
3. Classify the low-level runtimes: runc, gVisor, and Kata are low-level OCI runtimes - they create namespaces/cgroups and exec the container process, then (for runc) exit.
4. **Verify:** place `ctr` itself - it's a debug/admin client that talks gRPC directly to containerd, so it sits above the middle layer as a thin client, not inside it.

---

### Module: Architecture Deep Dive (`architecture`)

#### Lesson: Internal Services (`arch-services`)

**Say this:**

"Everything in containerd is built as plugins. The architecture is beautiful and modular. Let's talk about the services."

**The text block:**

> Almost everything in containerd is a plugin. Clients hit one socket; services handle one responsibility each.

**[DEMO] DemoArchitecture** - Show the plugin architecture and how services talk to each other

**Internal Services (Cards - 9 items):**

Say: "Here are the core services:"

1. **gRPC API Server** (Tag: API, Color: blue)
   - Body: "Listens on /run/containerd/containerd.sock for all client RPCs"
   - Say: "This is the front door. Every client connects here. All gRPC calls go to this server."

2. **CRI Plugin** (Tag: K8s, Color: sky)
   - Body: "Kubernetes Container Runtime Interface - kubelet path"
   - Say: "This is the Kubernetes hook. kubelet talks to containerd via the CRI API, which is implemented as a plugin."

3. **Image Service** (Tag: Images, Color: green)
   - Body: "Pull/push, manifests, tags, CAS storage, metadata"
   - Say: "Handles everything image-related. Pulling from registries, pushing back, managing metadata, content-addressable storage."

4. **Container Service** (Tag: Meta, Color: cyan)
   - Body: "Metadata + config only - container ≠ running process"
   - Say: "This is important: a container is just metadata and configuration. It's NOT a running process. The Container Service manages the metadata."

5. **Task Service** (Tag: Run, Color: yellow)
   - Body: "Running processes - spawn shims, kill, exec, metrics"
   - Say: "This is where the actual execution happens. When you want to start a container, the Task Service spawns a shim and manages the running process."

6. **Snapshot Service** (Tag: FS, Color: orange)
   - Body: "Filesystem snapshots via overlayfs/btrfs/zfs/…"
   - Say: "How does containerd layer images? Snapshots. This service builds and manages the filesystem layers."

7. **Content Service** (Tag: CAS, Color: pink)
   - Body: "Content-addressable blobs (layers by sha256)"
   - Say: "Raw blob storage. Every layer, every config file, everything is stored by its SHA256 hash. That's content-addressable storage."

8. **Namespace Service** (Tag: Tenancy, Color: teal)
   - Body: "Logical multi-tenancy: default / k8s.io / moby / custom"
   - Say: "You can partition containerd. Different namespaces for Kubernetes, Docker, custom apps. Complete isolation."

9. **Runtime Plugin IF** (Tag: OCI, Color: red)
   - Body: "runc, gVisor, Kata, Firecracker backends"
   - Say: "The actual execution engines. These are pluggable. You choose runc by default, but you can swap in other OCI runtimes."

**List plugins (Commands - 2):**

Say: "Let's see what plugins are active on your system:"

1. Command: `sudo ctr plugins list`
   - Output:
   ```
   TYPE                            ID           PLATFORMS     STATUS
   io.containerd.snapshotter.v1    overlayfs    linux/amd64   ok
   io.containerd.runtime.v2        runc         linux/amd64   ok
   io.containerd.grpc.v1           cri          linux/amd64   ok
   ```
   - Say: "Three key plugins: overlayfs for snapshots, runc for execution, and cri for Kubernetes. All marked 'ok' - they're all working."

2. Command: `sudo ctr plugins list | grep cri`
   - Note: "filter CRI plugin status"
   - Say: "Just checking that the CRI plugin is present and working. It's there, which means Kubernetes can talk to this containerd."

#### [LAB] List the internal services containerd exposes as plugins

**Goal:** List the internal services containerd exposes as plugins.

1. List all plugins - every internal service (gRPC API, CRI, image, container, task, snapshot, content, namespace, runtime) is registered as a plugin: `sudo ctr plugins list`
2. Find the CRI plugin - this is the path kubelet uses, it must report `ok` for Kubernetes to schedule pods on this node: `sudo ctr plugins list | grep cri`
3. Find the snapshotter plugin - confirms which filesystem backend (overlayfs, btrfs, zfs, …) is active: `sudo ctr plugins list | grep snapshotter`
4. **Verify:** every plugin line should read `STATUS: ok` - anything else means that service failed to initialize: `sudo ctr plugins list | grep -v ok`

---

#### Lesson: containerd-shim: Key Innovation (`arch-shim`)

**Say this:**

"Now we're getting to the genius part. This is why containerd is production-grade. Meet the shim."

**[DEMO] DemoShim** - Interactive demo of how the shim keeps containers alive

**[DEMO] VisualShimSurvival** - Show containers surviving a daemon restart

**The Problem (Callout - variant: warn):**

Say: "Imagine this scenario:"

> If the daemon owned containers directly, restarting containerd would kill every workload. Unacceptable in production.

Say: "You restart the daemon for an update. Boom. Every container dies. Your production service goes down. This is a non-starter."

**The Solution (Callout - variant: success):**

Say: "So containerd invented the shim:"

> Per-container shim (containerd-shim-runc-v2): owns stdio FDs, exit code, PID file, reaps zombies, keeps the process alive across daemon restarts.

Say: "Each container gets its own little supervisor. When the daemon restarts, the shim is still there. The shim keeps the container alive. This is genius."

**Process tree diagram:**

Say: "Here's what the process tree looks like:"

```
systemd (PID 1)
 └─ containerd
     ├─ containerd-shim-runc-v2  →  nginx (PID 1 in netns)
     ├─ containerd-shim-runc-v2  →  postgres
     └─ containerd-shim-runc-v2  →  python app
```

Say: "The daemon sits at the top. Under it, one shim per container. Each shim is the parent of its container process. The shim is the one who owns the exit code, the stdio, all of it."

**Shim responsibilities (List - 5 items):**

Say: "What does the shim actually do?"

- Stdio handling (stdin/stdout/stderr streams)
- Capture and report exit status
- Reap zombie processes
- TTY management for interactive containers
- Decouple daemon lifecycle from container lifecycle

Say: "The last one is the key. The daemon can die, but the shim keeps the container running. When the daemon comes back, it reconnects to the existing shims."

**Prove survival across restart (Commands - 4):**

Say: "Let's actually prove this works. Watch:"

1. Command: `nerdctl run -d --name test nginx`
   - Say: "Start a container."

2. Command: `ps aux | grep containerd`
   - Note: "see daemon + shim-runc-v2 lines"
   - Say: "You can see the daemon and the shim. Both running."

3. Command: `systemctl restart containerd`
   - Say: "Now we restart the daemon. This is the scary moment. Watch what happens to the container."

4. Command: `nerdctl ps`
   - Note: "container "test" still running - shim kept it alive"
   - Say: "The container is STILL RUNNING. It never died. The shim kept it alive while the daemon was down. This is why containerd is production-grade."

**Runtime state paths (Tree - ALL lines):**

Say: "Behind the scenes, here's where containerd stores the shim state:"

```
/run/containerd/io.containerd.runtime.v2.task/
└── <namespace>/
    └── <container-id>/
        ├── config.json   # OCI runtime spec
        ├── init.pid
        ├── log.json
        └── rootfs/      # if bundle mode
```

Say: "For every container, there's a directory with the OCI spec, the PID file, logs, everything the shim needs to manage the container."

#### [LAB] Find the shim process backing a running task

**Goal:** Find the containerd-shim process backing a running task.

1. Start a task so it has a shim: `nerdctl run -d --name test nginx`
2. Find the shim in the process tree - containerd-shim-runc-v2 sits between containerd and the container init process: `ps --forest -o pid,ppid,cmd -g $(pgrep containerd | head -1)`
3. Note it stays attached to the socket - the shim, not the daemon, owns stdio, exit code, and reaping for this container: `ps aux | grep containerd-shim`
4. Restart the daemon - this should not kill the workload if the shim is doing its job: `systemctl restart containerd`
5. **Verify:** the container is still running - the shim PID survived the daemon restart untouched: `nerdctl ps`

---

#### Lesson: containerd Namespaces (Multi-Tenancy) (`arch-namespaces`)

**Say this:**

"Wait, I need to clarify something. When people talk about 'containerd namespaces,' they're NOT talking about Linux namespaces. This is confusing."

**Callout - Not Linux namespaces (variant: info):**

Say: "Important distinction:"

> containerd namespaces are logical resource partitions (images, containers, tasks, snapshots). Linux namespaces (pid/net/mnt/…) are created by runc for each container.

Say: "Linux namespaces isolate PROCESSES. containerd namespaces partition RESOURCES. Different thing."

**[DEMO] VisualNamespaces** - Show multiple namespaces in containerd

**Namespace ops (Commands - 12!):**

Say: "Let's work with namespaces. There's a lot of commands here:"

1. Command: `sudo ctr namespaces list`
   - Note: "common: default, k8s.io (Kubernetes), moby (Docker)"
   - Say: "These are the default namespaces. k8s.io is where Kubernetes puts its containers. moby is where Docker puts its containers. They never interfere."

2. Command: `sudo ctr namespaces create production`
   - Say: "Create a new namespace called 'production'."

3. Command: `sudo ctr namespaces create staging`
   - Say: "Another one called 'staging'."

4. Command: `sudo ctr namespaces create development`
   - Say: "And 'development'."

5. Command: `sudo ctr namespaces create production --label env=prod`
   - Say: "You can label namespaces when you create them. This one is labeled as a production environment."

6. Command: `sudo ctr namespaces get production`
   - Say: "Get the details of a namespace."

7. Command: `sudo ctr namespaces label production team=backend`
   - Say: "Add a label to an existing namespace. Now this namespace is labeled with the team that owns it."

8. Command: `sudo ctr --namespace=production images pull docker.io/library/nginx:1.24`
   - Say: "Pull an image, but put it in the 'production' namespace specifically. Long form."

9. Command: `sudo ctr -n staging images pull docker.io/library/nginx:1.25`
   - Say: "Same thing, shorter: `-n` for namespace. Pull a different version into 'staging'."

10. Command: `sudo ctr --namespace=production containers list`
    - Say: "List containers in a specific namespace."

11. Command: `sudo ctr namespaces remove my-namespace`
    - Note: "must be empty"
    - Say: "Delete a namespace. It has to be empty - no images, no containers."

12. Command: `sudo ctr namespaces remove --force my-namespace`
    - Note: "dangerous"
    - Say: "Force delete. This is dangerous - it will delete the namespace even if it has stuff in it. Don't do this lightly."

**Why it matters (List - 4 items):**

Say: "Multi-tenancy is actually really important:"

- Multiple K8s clusters / tenants on one host
- Dev / staging / prod isolation
- Team isolation and accounting
- Docker (moby) and K8s (k8s.io) never collide resources

Say: "Imagine you're running two Kubernetes clusters on the same machine. With namespaces, they're completely separate. No image sharing, no metadata collisions. Clean."

#### Cards: Linux Kernel Namespaces (the OS Mechanism, Not containerd's)

Say: "Now let's actually define the *other* namespaces - the kernel ones runc creates per container. Six of them matter:"

1. **PID** - "A process sees only its own process tree - it can be PID 1 inside the container while being a normal PID on the host."
2. **NET** - "A private set of network interfaces, IPs, routes, and ports - separate from the host network stack."
3. **MNT** - "A private view of mount points, so the container root filesystem doesn't leak host mounts (or vice versa)."
4. **UTS** - "A private hostname and domain name, independent of the host's."
5. **IPC** - "Isolated System V IPC and POSIX message queues - one container can't see another's shared memory segments."
6. **USER** - "Maps UID/GID inside the container to different (often unprivileged) IDs on the host - the basis for rootless containers."

#### Callout: Two Different "Namespace" Words (info)

> These 6 kernel namespaces are created by runc per container to isolate a resource view. containerd namespaces (default/k8s.io/moby, above) are a completely separate, higher-level concept: logical partitions of containerd's own metadata. Same word, two unrelated mechanisms.

Say: "Say this twice if you have to. People conflate these constantly. Kernel namespaces isolate a *process's view of the OS*. containerd namespaces partition *containerd's own bookkeeping*. Both use the word 'namespace.' They have nothing else in common."

#### [LAB] Create and use a custom containerd namespace end to end

**Goal:** Create and use a custom containerd namespace end to end.

1. Create the namespace - this is a containerd (logical) namespace, not a Linux kernel one: `sudo ctr namespaces create demo`
2. Pull an image into it - every operation must be explicitly scoped with -n/--namespace: `sudo ctr -n demo images pull docker.io/library/nginx:latest`
3. Run a container scoped to it - the container only exists inside the demo namespace: `sudo ctr -n demo run -d docker.io/library/nginx:latest demo-nginx`
4. Check the default namespace - the container should be invisible here, namespaces isolate containerd metadata: `sudo ctr -n default containers list`
5. **Verify:** demo-nginx appears in the demo namespace listing but not in default, proving the isolation: `sudo ctr -n demo containers list`

---

### Module: How It Works Internally (`internals`)

#### Lesson: Phase 1 - Image Pull (`life-pull`)

**Say this:**

"Now let's trace what happens when you pull an image. This is Phase 1 of the container lifecycle."

**[DEMO] DemoImagePull** - Live walkthrough of pulling an image

**Command to start:**

Say: "Let's pull an image:"

Command: `nerdctl pull nginx:latest`
- Note: "user-facing; same path under the hood as ctr images pull"
- Say: "You use nerdctl for a nice experience. But the path under the hood is identical to the raw `ctr` command."

**Internal flow (Steps - 8 items):**

Say: "Here's what happens behind the scenes:"

1. Step: "Client request"
   - Detail: "nerdctl/ctr sends gRPC Pull to containerd"
   - Say: "The client sends a gRPC request to the daemon."

2. Step: "Image service"
   - Detail: "handles resolve + fetch pipeline"
   - Say: "The Image Service jumps into action."

3. Step: "Registry resolution"
   - Detail: "nginx:latest → docker.io/library/nginx:latest"
   - Say: "There's a shorthand. 'nginx:latest' actually means 'docker.io/library/nginx:latest'. containerd resolves that."

4. Step: "Manifest fetch"
   - Detail: "JSON describing layers + config"
   - Say: "First, fetch the manifest. This is a JSON file that says 'this image has these layers' and 'the config file is this hash'."

5. Step: "Layer download"
   - Detail: "layers downloaded in parallel"
   - Say: "Download all the layers. containerd does this in parallel for speed."

6. Step: "Content store"
   - Detail: "blobs under /var/lib/containerd/io.containerd.content.v1.content/"
   - Say: "Every layer, every file, gets stored here. Keyed by its SHA256 hash."

7. Step: "Unpack snapshot"
   - Detail: "snapshotter builds filesystem snapshot from layers"
   - Say: "Now assemble the layers into a snapshot. This is an overlayfs mount or btrfs subvolume, depending on your snapshotter."

8. Step: "Metadata update"
   - Detail: "BoltDB meta.db records image refs"
   - Say: "Finally, update the metadata. The BoltDB database records that you have this image."

**On-disk after pull (Tree - ALL lines):**

Say: "Here's what you get on disk:"

```
/var/lib/containerd/
├── io.containerd.content.v1.content/
│   ├── blobs/sha256/{abc…, def…, ghi…}
│   └── ingest/  (temp downloads)
├── io.containerd.snapshotter.v1.overlayfs/snapshots/
└── io.containerd.metadata.v1.bolt/meta.db
```

Say: "Content store with blobs. Snapshot directory with the assembled layers. Metadata database."

**ctr equivalent (Commands - 3):**

Say: "Here's how to do the same thing with the raw ctr command:"

1. Command: `sudo ctr images pull docker.io/library/nginx:latest`
   - Note: "full reference required - no Docker shorthand"
   - Say: "You have to use the full reference. ctr doesn't do the shorthand expansion."

2. Command: `sudo ctr images list`
   - Say: "List all images you've pulled."

3. Command: `sudo ctr content list`
   - Note: "raw CAS blobs"
   - Say: "List the raw content blobs. This is everything that's been downloaded."

#### [LAB] See exactly where pulled layers land in the content store

**Goal:** Pull an image and see exactly where its layers land in the content store.

1. Pull a small image - alpine is small enough to inspect quickly: `sudo ctr images pull docker.io/library/alpine:latest`
2. List the content blobs - every layer + config + manifest is stored as a sha256-addressed blob: `sudo ctr content list`
3. Pick one digest and find it on disk - the digest is literally the directory path under the content store: `ls /var/lib/containerd/io.containerd.content.v1.content/blobs/sha256/`
4. **Verify:** grab any digest `ctr content list` printed and confirm it matches a filename in that directory - proving CAS storage is exactly "path = hash of contents": `sudo ctr content list | head -1`

---

#### Lesson: Phase 2 - Container Create (`life-create`)

**Say this:**

"Phase 2. You've pulled the image. Now you want to create a container. This is important: creating ≠ running."

**[DEMO] DemoLifecycle** - Show the container lifecycle visually

**[DEMO] VisualContainerLifecycle** - Diagram of states the container goes through

**Command:**

Say: "Let's create and run a container:"

Command: `nerdctl run -d --name web -p 8080:80 nginx:latest`
- Say: "This single command does create AND start. But they're separate operations internally."

**Steps (6 items):**

Say: "Here's what happens when you create a container:"

1. Step: "Parse args"
   - Detail: "ports, name, env, mounts"
   - Say: "Parse your command line. Extract the ports, the name, the environment variables, the mounts."

2. Step: "Create container object"
   - Detail: "metadata only - process not started yet"
   - Say: "Create a container object. This is just metadata and configuration. No process is running yet."

3. Step: "Writable snapshot"
   - Detail: "active snapshot on top of image snapshot (COW)"
   - Say: "Take the read-only image snapshot and create a writable layer on top of it. Copy-on-write."

4. Step: "Store metadata"
   - Detail: "ID, image, snapshot key, labels, OCI-ish spec"
   - Say: "Store all the metadata: which image, which snapshot, labels, all the config."

5. Step: "Network setup"
   - Detail: "CNI plugins create network namespace / interfaces"
   - Say: "Set up the network namespace. CNI plugins create the veth pair, assign the IP, all that."

6. Step: "Assign ID"
   - Detail: "unique container id"
   - Say: "Give the container a unique ID."

**Container object (Code block - JSON):**

Say: "Here's what the container object looks like conceptually:"

```json
{
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
}
```

Say: "Just configuration. No running process yet."

**Callout - Container vs Task (variant: tip):**

Say: "This is a key conceptual distinction:"

> In containerd, create = metadata. Start task = live process with PID. Docker collapses these; containerd keeps them separate on purpose.

Say: "This separation is why containerd is so clean. Docker hides it from you, but internally it's the same. containerd makes it explicit in the API."

#### [LAB] Create a container and inspect its metadata without starting it

**Goal:** Create a container and inspect its metadata without starting it.

1. Create the container - this only writes metadata, no process runs yet: `sudo ctr containers create docker.io/library/nginx:latest lab-web`
2. Inspect it - shows the container object: image ref, snapshot key, spec, but no PID field: `sudo ctr containers info lab-web`
3. Check for a task - confirms there is no running process attached yet: `sudo ctr tasks list`
4. **Verify:** lab-web should be absent from the task list - proof that "create" produced metadata only, matching the Container vs Task distinction above: `sudo ctr tasks list | grep lab-web || echo "no task - as expected"`

---

#### Lesson: Phase 3 - Task Start (`life-start`)

**Say this:**

"Phase 3. Now we actually start the process. This is where the shim gets born."

**[DEMO] VisualTaskStart** - Animate the process creation

**Start pipeline (Steps - 9 items):**

Say: "Here's the full startup sequence:"

1. Step: "Task service"
   - Detail: "owns execution path"
   - Say: "The Task Service is in charge now."

2. Step: "Spawn shim"
   - Detail: "containerd-shim-runc-v2 for this container"
   - Say: "Create a new shim process. One per container."

3. Step: "OCI spec"
   - Detail: "generate config.json (namespaces, mounts, caps, seccomp)"
   - Say: "Generate the OCI spec. This is the config.json file that tells runc exactly what to do."

4. Step: "Shim → runc"
   - Detail: "shim invokes low-level runtime"
   - Say: "The shim calls runc."

5. Step: "Linux namespaces"
   - Detail: "PID, NET, MNT, UTS, IPC, USER"
   - Say: "runc creates the namespaces. PID namespace so the process is isolated. NET namespace for networking. MNT namespace for filesystem. UTS for hostname. IPC for inter-process communication. USER for user isolation."

6. Step: "cgroups"
   - Detail: "CPU/memory/IO limits"
   - Say: "Set up cgroups for resource limiting."

7. Step: "Security"
   - Detail: "capabilities, seccomp, AppArmor/SELinux"
   - Say: "Apply security policies."

8. Step: "Rootfs mount"
   - Detail: "overlay merged view as container /"
   - Say: "Mount the merged overlayfs as the container's root filesystem."

9. Step: "Exec init"
   - Detail: "container PID 1 (e.g. nginx)"
   - Say: "Execute the init process. In a container, nginx becomes PID 1."

**Process tree after start (Diagram):**

Say: "After all that, the process tree looks like this:"

```
systemd (PID 1)
 └─ containerd (PID 1234)
     └─ containerd-shim-runc-v2 (PID 5678)
         └─ nginx (PID 1 in container = PID 5679 on host)
             ├─ nginx worker 1
             └─ nginx worker 2
```

Say: "The daemon is the grandparent. The shim is the parent. The container process is the child. If the daemon dies, the shim is still there."

**Inspect host namespaces (Commands - 1):**

Say: "Want to see the namespaces? Here's how:"

Command: `ls -la /proc/5679/ns/`
Output:
```
pid -> 'pid:[4026532555]'
net -> 'net:[4026532558]'
mnt -> 'mnt:[4026532556]'
uts -> 'uts:[4026532557]'
```

Say: "Each line is a namespace. That number in brackets is the namespace ID. If you have two containers with the same pid namespace ID, they're in the same PID namespace - which shouldn't happen. Different IDs mean different namespaces, which is correct."

#### [LAB] Trace a task's process tree down to PID 1

**Goal:** Start a task and trace its process tree down to the container's PID 1.

1. Start the task - launch a container so it has a real host PID: `sudo ctr run -d docker.io/library/nginx:latest lab-start`
2. Get the PID - `tasks list` reports the host-side PID of the container init process: `sudo ctr tasks list`
3. Trace the process tree - walk up from that PID to confirm containerd-shim-runc-v2 is its parent, not containerd itself: `ps --forest -o pid,ppid,cmd`
4. **Verify:** the PID from `tasks list` should have its own PID/NET/MNT/UTS namespaces, distinct from the host - confirming runc actually isolated it: `ls -la /proc/<pid>/ns/`

---

#### Lesson: Phase 4–6 - Monitor, Stop, Remove (`life-ops-stop`)

**Say this:**

"Phases 4, 5, and 6. The container is running. Now we talk about what happens while it's running, then stopping it, then removing it."

**While running (List - 5 items):**

Say: "While the container is running:"

- Shim monitors the process
- Health checks (if configured)
- Metrics via cgroups
- Log streaming of stdout/stderr
- gRPC API remains available

Say: "The shim is watching. If the process dies, the shim notices. Health checks run on a schedule. Metrics come from cgroups. Logs are streamed from the shim. And you can still make gRPC calls to the daemon."

**Operate on running container (Commands - 3):**

Say: "How do you interact with a running container? With nerdctl:"

1. Command: `nerdctl exec -it web bash`
   - Say: "Execute a command in the container. In this case, an interactive bash shell."

2. Command: `nerdctl logs web`
   - Say: "Stream the logs. stdout and stderr from the container."

3. Command: `nerdctl stats web`
   - Say: "Live metrics. CPU, memory, block IO."

**Stop (Steps - 5 items):**

Say: "When you stop the container:"

1. Step: "Stop request"
   - Detail: "task service receives stop"
   - Say: "The Task Service gets the stop request."

2. Step: "SIGTERM"
   - Detail: "graceful signal to init process"
   - Say: "Send SIGTERM. Polite. Let the process clean up."

3. Step: "Grace period"
   - Detail: "default ~10s"
   - Say: "Give it 10 seconds to shut down gracefully."

4. Step: "SIGKILL"
   - Detail: "if still alive"
   - Say: "If it didn't shut down, SIGKILL it. No mercy."

5. Step: "Cleanup"
   - Detail: "shim cleans process; network ns removed; state = stopped"
   - Say: "Clean up. Remove the network namespace. Update the state to stopped."

**Remove (Steps - 4 items):**

Say: "When you remove the container:"

1. Step: "Verify stopped"
   - Detail: "refuse delete if task still running (unless force)"
   - Say: "Make sure the container is stopped first. Unless you force it."

2. Step: "Delete writable snapshot"
   - Detail: "container upper layer gone"
   - Say: "Delete the writable layer. The container filesystem is gone."

3. Step: "Metadata cleanup"
   - Detail: "container record removed"
   - Say: "Delete the metadata from the database."

4. Step: "Shim exits"
   - Detail: "no more process to supervise"
   - Say: "The shim has nothing left to do, so it exits."

**ctr ordered cleanup (Commands - 4 - CRITICAL ORDER):**

Say: "This is VERY important. The order matters. Always do it in this order:"

1. Command: `sudo ctr tasks kill web`
   - Say: "Kill the task. SIGKILL."

2. Command: `sudo ctr tasks delete web`
   - Say: "Delete the task from containerd's tracking."

3. Command: `sudo ctr containers remove web`
   - Say: "Remove the container metadata."

4. Command: `sudo ctr images rm docker.io/library/nginx:latest`
   - Note: "optional image cleanup"
   - Say: "Optionally remove the image."

**Callout - Order matters (variant: danger):**

Say: "This is why you need to understand containerd:"

> Always: kill task → delete task → remove container. Wrong order = containerd errors. Docker hides this; ctr makes it explicit.

Say: "Docker does this for you automatically. But when you're debugging with ctr, you need to know the order. Do it wrong and containerd will complain at you."

#### [LAB] Cleanly stop and remove a task and its container

**Goal:** Cleanly stop and remove a task and its container.

1. Start something to clean up - give yourself a running task to tear down: `sudo ctr run -d docker.io/library/nginx:latest lab-cleanup`
2. Kill the task - sends SIGTERM (then SIGKILL after the grace period) to the init process: `sudo ctr tasks kill lab-cleanup`
3. Delete the task - removes the task object once the process has exited: `sudo ctr tasks delete lab-cleanup`
4. Remove the container - removes the container metadata and its writable snapshot: `sudo ctr containers remove lab-cleanup`
5. **Verify:** both listings should come back empty for lab-cleanup - everything was torn down in the correct order: `sudo ctr containers list; sudo ctr tasks list`

---

### Module: History & Evolution (`history`)

#### Lesson: From Docker Monolith to Industry Standard (`history-timeline`)

**Say this:**

"Let's zoom out. How did we get here? Why is containerd so important? The story is fascinating."

**Timeline (Steps - 8 items):**

Say: "Here's how it evolved:"

1. Step: "2013 - Docker born"
   - Detail: "Monolithic: build, ship, run, net, volumes, Swarm"
   - Say: "Docker was all-in-one. One process doing everything. Build, run, orchestrate, networks, volumes."

2. Step: "2015 - Modularization"
   - Detail: "Tight coupling hurts maintenance, integration, resource use"
   - Say: "But tight coupling is bad. It's hard to maintain. Hard to integrate. Uses too much memory."

3. Step: "2016 - containerd extracted"
   - Detail: "Focus: run containers well; OCI; embeddable"
   - Say: "Docker extracted the runtime. Here's the core: run containers really well. Make it embeddable so others can use it."

4. Step: "2017 - CNCF donation"
   - Detail: "Neutral governance; industry collaboration"
   - Say: "Docker donated containerd to CNCF. Neutral governance. Now it's not just Docker's baby - it's the whole industry's."

5. Step: "2017–18 - CRI plugin"
   - Detail: "kubelet → CRI → containerd → runc; ~30% faster pods, ~50% less mem vs dockershim path"
   - Say: "Kubernetes created the CRI standard. containerd implemented it as a plugin. Suddenly, Kubernetes could talk directly to containerd instead of going through Docker Engine. Result: faster pods, way less memory."

6. Step: "2019 - CNCF graduated"
   - Detail: "Highest maturity; production-ready at scale"
   - Say: "CNCF gave it the highest maturity badge. It's production-ready at scale."

7. Step: "2020–22 - dockershim removed"
   - Detail: "K8s 1.24 drops Docker-as-runtime shim; containerd recommended"
   - Say: "Kubernetes 1.24 said: we're removing the dockershim. Use containerd instead. Full stop."

8. Step: "2023+ - Modern era"
   - Detail: "75%+ K8s share; encryption, stargz lazy pull, multi-runtime, security hardening"
   - Say: "Now, 75% of Kubernetes clusters use containerd. It's the standard. Encryption, lazy loading, multiple runtimes, all the security hardening."

**Path simplification (Compare - Before vs After):**

Say: "The path got shorter and faster:"

**Before (dockershim):**
- Items:
  - K8s → dockershim → Docker Engine → containerd → runc
  - Extra hop, more memory
  - Shim maintained by K8s team
- Say: "Kubernetes had to maintain a shim that talked to Docker Engine, which then talked to containerd. Roundabout."

**After (CRI direct):**
- Items:
  - K8s → CRI plugin → containerd → runc
  - Faster pod startup
  - Simpler, more reliable
- Say: "Now it's direct. Kubernetes talks to containerd's CRI plugin. That's it."

**What left Docker vs what went to containerd (List - 2 items):**

Say: "So what stayed in Docker, and what went to containerd?"

- Item 1: "Extracted: execution, image pull/push, storage, snapshots, net ns hooks"
  - Say: "All the heavy lifting. The actual container runtime."

- Item 2: "Remained in Docker: CLI, build (BuildKit later split), Compose, Swarm, DX APIs"
  - Say: "The user experience stuff. The nice CLI, building images, orchestration, developer experience."

---

### Module: ContainerD vs Others (`compare`)

#### Lesson: vs Docker Engine (`vs-docker`)

**Say this:**

"Now let's compare. How is containerd different from Docker? They're related, but they're not the same thing."

**Comparison table (11 rows):**

Say: "Here's the comparison:"

| Aspect | Docker Engine | ContainerD |
|--------|---------------|-----------|
| What it is | Complete platform | Core runtime |
| Users | Developers / DevOps | Platforms / orchestrators |
| Binary size | ~100 MB | ~30 MB |
| Memory idle | ~150 MB | ~30 MB |
| Startup | 2–3 s | <1 s |
| Container launch | ~800 ms | ~500 ms |
| CLI | Rich docker | Basic ctr (debug) |
| Image build | Built-in | Separate (BuildKit) |
| Compose | Yes | nerdctl compose |
| Best for | Dev & learning | Prod & Kubernetes |
| Architecture | Docker → containerd → runc | containerd → runc |

Say: "Notice the binary size and memory usage. Docker is heavier. containerd is lean. Notice the startup time - containerd is faster. Notice the CLI - Docker has a rich CLI, containerd has a debug CLI. Notice the architecture - Docker adds an extra layer."

**Callout - Fun fact (variant: tip):**

Say: "Here's the plot twist:"

> Docker Engine uses containerd internally. Path: Docker CLI → Docker Engine → containerd → runc.

Say: "Docker didn't give up on containerd. Docker USES containerd. Docker is a pretty wrapper around containerd."

---

#### Lesson: vs CRI-O & vs runc (`vs-crio-runc`)

**Say this:**

"There are other runtimes out there. Let's talk about CRI-O. And let's clarify what runc is."

**CRI-O vs ContainerD (Compare - 6 items each):**

Say: "Here are the key differences:"

**CRI-O:**
- Items:
  - Kubernetes-only runtime
  - ~50K LOC (simpler)
  - Red Hat / OpenShift ecosystem
  - ~20% of K8s clusters
  - Linux only
  - Native CRI
- Say: "CRI-O is the minimalist approach. It's designed specifically for Kubernetes. It's simpler. You'll find it in OpenShift. But only 20% of K8s clusters use it."

**ContainerD:**
- Items:
  - General-purpose runtime
  - ~100K LOC full-featured
  - Docker + K8s + custom
  - ~75% of K8s clusters
  - Linux + Windows
  - CRI via plugin
- Say: "containerd is the general-purpose tool. Bigger codebase because it does more. Works with Docker, Kubernetes, custom tools. 75% of clusters. Windows support. CRI is a plugin, not core."

**runc is not a competitor (Text block):**

Say: "Okay, runc. This is important."

> runc is a component. containerd uses runc (or another OCI runtime). runc creates namespaces/cgroups, starts the process, then typically exits - the shim stays.

Say: "runc is not a competitor to containerd. runc is a PART of how containerd works. runc is the low-level executor. containerd is the daemon that coordinates everything."

**Low-level runc-only sketch (Code block - bash):**

Say: "For educational purposes, here's how you'd use runc by itself, without containerd:"

```bash
# Prepare OCI bundle directory with rootfs + config.json
mkdir -p /mycontainer/rootfs
# ... extract image fs into rootfs ...
cd /mycontainer && runc spec
# edit config.json
runc run mycontainer
```

Say: "You manually create the bundle, you manually run runc. This is what containerd is doing for you automatically. This is why containerd exists - to automate all of this."

#### [LAB] Confirm runc is underneath your containerd tasks, not a competitor

**Goal:** Confirm runc is the low-level runtime underneath your containerd tasks, not a competing tool.

1. Start a task through containerd - use the normal high-level path, containerd delegates execution to runc under the hood: `sudo ctr run -d docker.io/library/nginx:latest lab-runc`
2. Get the containerd-side ID - this is the ID containerd knows the task by: `sudo ctr tasks list`
3. List the same container at the runc level - runc keeps its own state directory per runtime namespace, this shows the exact same container from underneath containerd: `sudo runc --root /run/containerd/runc/default list`
4. **Verify:** the container ID and state (running) shown by `runc list` should match `ctr tasks list` exactly - proof containerd delegates to runc rather than replacing it: `sudo runc --root /run/containerd/runc/default state lab-runc`

---

## END OF PART 1 NOTES

**Summary (Say this to close):**

"We've covered the foundations. You understand what containerd is. You understand the architecture. You understand the lifecycle. You understand why it matters.

Here's the key insight: containerd is the industry-standard runtime because it solved the problem Docker couldn't solve. It's embeddable. It's modular. It's governance-neutral. It's gotten faster and leaner over time.

When you see '75% of Kubernetes clusters use containerd,' that's not an accident. That's the result of seven years of innovation, CNCF governance, and deep focus on doing one thing really well: running containers.

In Part 2, we're going to go deeper. We're going to talk about performance, security, advanced features. But this foundation - this is what you need to understand everything else."

---

**PRESENTATION STYLE NOTES FOR THE INSTRUCTOR:**

- When covering demos, actually RUN them. Don't just talk about them.
- When covering the shim, this is the "wait what?" moment. Pause. Let it sink in.
- When comparing Docker vs containerd, emphasize the "Docker uses containerd" fact. This surprises people.
- When explaining namespaces (the containerd kind, not Linux kind), this is confusing. Repeat it multiple times.
- When going through the container lifecycle, draw on a whiteboard. These are the steps. Draw the tree. Make it visual.
- When talking about the socket at /run/containerd/containerd.sock, show it. `ls -l` it. Make it real.
- The CRI-O comparison is brief but important. containerd won, but CRI-O is still respectable in the OpenShift world.
- End on the history timeline. It's the "aha" moment. Everything makes sense after you understand the journey.
# CONTAINERD MASTERCLASS — PART 2 TEACHING NOTES

## PART 2 · INTERNALS

Welcome to the fun, nerdy underworld of containerd! Part 2 is where we stop asking "how do I use this?" and start asking "what black magic is happening underneath?" Buckle up—this is where images become snapshots, filesystems merge like sorcery, and security layers pile up like a lasagna made of bureaucracy.

---

## Module: Snapshots & OverlayFS

### Lesson: Snapshotter System (`snap-system`)

**Say this:** "Containerd is a *plugin-based* system. It doesn't care HOW you store your images—it cares THAT you can give it parent layers and writable snapshots. That's what a snapshotter plugin does."

---

#### Text Block

"containerd does not hard-code one filesystem design. It talks to a snapshotter plugin. The snapshotter owns chains of read-only parent layers and writable active snapshots for containers."

**The Analogy:** Think of a snapshotter like a *librarian*. Containerd says "I need a read-only copy of Book A, and a blank notebook to write in." The librarian doesn't care if they use filing cabinets (overlayfs), ancient scrolls (btrfs), or carrier pigeons (stargz). They just say "here's your read-only layer, here's your writable layer, now merge them."

---

#### [DEMO] VisualSnapshotSystem (`demoId: VisualSnapshotSystem`)

**Demo Description:**
A carousel showing backend names cycling through: overlayfs → btrfs → zfs → devmapper → native → stargz. Each rotates on a button labeled "Show me another snapshotter." Three action buttons:
- **Prepare** — simulate preparing a new writable snapshot
- **Commit** — finalize a snapshot into the chain
- **Reset** — discard changes

This visually drives home the idea: "Same interface, different backends."

---

#### Diagram: Abstraction

```
containerd  →  snapshotter plugin  →  filesystem backend
              (overlayfs | btrfs | zfs | native | devmapper | stargz)
```

**Say this:** "This abstraction is why containerd is portable. Linux? Windows? VMs? Doesn't matter—just plug in the right snapshotter."

---

#### Table: Common Snapshotters

| Snapshotter | Style | Notes |
|---|---|---|
| overlayfs | Union FS | Default on Linux; fast; ubiquitous |
| btrfs | COW FS | Native snapshots on btrfs |
| zfs | COW FS | Advanced snapshot features |
| devmapper | Block | Thin provisioning / block level |
| native | Directories | Windows / simple dir copy |
| stargz | Lazy pull | Start before full download |

**Say this:** "For 99% of you, overlayfs is your answer. It's fast, it's everywhere, and it's boring in the best way. But if you've got btrfs or zfs already, why not use their native snapshot magic?"

---

#### Commands: Snapshot CLI

```bash
# List all snapshots (default snapshotter)
sudo ctr snapshots list

# List with explicit snapshotter
sudo ctr snapshots --snapshotter overlayfs list

# Get info about one snapshot
sudo ctr snapshots info <snapshot-key>

# Prepare a writable snapshot from a parent
sudo ctr snapshots prepare my-snapshot parent-snapshot

# Commit changes (freeze it into the chain)
sudo ctr snapshots commit new-snapshot my-snapshot

# Delete a snapshot
sudo ctr snapshots remove my-snapshot

# View parent/child relationships (tree structure)
sudo ctr snapshots tree
# note: view parent/child relationships
```

**Say this:** "Try `ctr snapshots tree` on a running system—you'll see exactly how images layer up. It's a beautiful family tree of your filesystem."

---

#### Code: Select Snapshotter in config.toml

```toml
[plugins."io.containerd.grpc.v1.cri".containerd]
  snapshotter = "overlayfs"  # or btrfs, zfs, stargz, ...
```

**Say this:** "This one line tells containerd which snapshotter plugin to use. Change it, restart, and boom—different filesystem backend, same API."

---

### Lesson: OverlayFS Deep Dive (`overlayfs`)

**Say this:** "OverlayFS is the Frankenstein of filesystems. It doesn't store anything itself—it *stitches* other directories together and pretends it's one file."

---

#### [DEMO] DemoOverlayFS (`demoId: DemoOverlayFS`)

**Demo Description:**
An interactive demo where you:
1. Click "Create upperdir file" — see it appear in the merged view
2. Click "Modify lowerdir file" — watch copy-on-write in action
3. Click "Delete lowerdir file" — a whiteout appears
4. Inspect the real mount command output

Real-time visualization of the layers and what the container actually sees.

---

#### [DEMO] VisualOverlayFS (`demoId: VisualOverlayFS`)

**Demo Description:**
A layered diagram showing:
- **Bottom:** lowerdir (read-only, grayed out, labeled "/image/layer1")
- **Middle:** lowerdir (another layer, also grayed, labeled "/image/layer2")
- **Above:** upperdir (bright green, labeled "/container/writes")
- **Top:** merged (full color, labeled "what container sees")

Arrows show reads going up first, writes landing in upperdir, and deletes creating whiteouts. Click on any layer to highlight which files live where.

---

#### Text Block

"OverlayFS merges directories into one unified view. containerd uses it for copy-on-write: image layers shared read-only; each container gets its own writable upper layer."

**The Analogy:** Imagine a *transparency stack* on an overhead projector. The image layers are the bottom transparencies (read-only, shared). Each container gets its own blank transparency on top (upperdir). When the container modifies something, it writes to its blank layer. You see all layers at once (merged), but you can't accidentally erase the originals.

---

#### Cards: Four Directories

**Card 1: lowerdir**
- **Title:** lowerdir
- **Tag:** RO (blue)
- **Body:** One or more read-only layers (image parents), stacked bottom→top

**Card 2: upperdir**
- **Title:** upperdir
- **Tag:** RW (green)
- **Body:** Writable layer for THIS container only

**Card 3: workdir**
- **Title:** workdir
- **Tag:** TMP (yellow)
- **Body:** Kernel temp dir for atomic copy-up operations

**Card 4: merged**
- **Title:** merged
- **Tag:** VIEW (mcb)
- **Body:** Unified view the container process actually sees as /

**Say this:** "These four directories are the *entire architecture* of OverlayFS. Understand them, and you understand why containers are cheap."

---

#### Steps: Read vs Write

**Step 1: Read**
- **Title:** Read
- **Detail:** Look upper first; if missing, fall through lower layers. Process sees a full FS.
- **The explanation:** When your container reads `/etc/hostname`, OverlayFS checks upperdir first. Not there? Check lowerdir1. Not there? Check lowerdir2. Found it? Return it. The container doesn't know which layer it came from—it just sees one filesystem.

**Step 2: Write existing file**
- **Title:** Write existing file
- **Detail:** Copy-on-write: copy from lower → upper, then modify the copy. Lower never changes.
- **The magic:** Want to edit `/etc/passwd`? OverlayFS copies it from lowerdir to upperdir first (copy-on-write), *then* you modify the copy in upperdir. The original in the image is untouched. Your changes are isolated. Another container sees the original.

**Step 3: Create new file**
- **Title:** Create new file
- **Detail:** Appears only in upperdir
- **Simple:** Brand new file? Goes straight to upperdir. Easy.

**Step 4: Delete lower file**
- **Title:** Delete lower file
- **Detail:** Whiteout in upper hides lower file from merged view
- **The trick:** You can't actually delete from a read-only layer. Instead, OverlayFS creates a *whiteout* file (a special marker) in upperdir that says "this file is deleted." When you list the merged view, that file is hidden. But it still exists in lowerdir—other containers can still see it.

**Say this:** "Copy-on-write is the secret sauce. You get isolation WITHOUT copying entire images. That's why you can run 100 containers from the same image without 100 copies of the image on disk."

---

#### Tree: On-disk Paths

```
/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/
├── snapshots/
│   ├── 1/fs   # image layer snapshot
│   ├── 2/fs   # another parent / container upper
│   └── 3/fs
└── metadata.db
```

**Say this:** "Poke around in `/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/`. You'll see real directories. Peek inside—you'll find actual `/bin`, `/etc`, `/usr`, etc. That's the physical image storage."

---

#### Commands: See Real Mounts

```bash
# See the actual mount command OverlayFS is using
mount | grep overlay
# note: shows lowerdir=, upperdir=, workdir= for each container

# List the snapshots directory
sudo ls /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/
```

**Demo Output (example):**
```
overlay on /run/containerd/io.containerd.runc.v2.task/...  (...)
  lowerdir=/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/1/fs:/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/2/fs
  upperdir=/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/3/fs
  workdir=/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/3/work
```

**Say this:** "That `mount | grep overlay` output is *proof* that your layering is real. You can literally see the paths. Go poke around if you don't believe me!"

---

#### Callout: Why Containers Are Cheap (success)

**Body:**
Image layers shared across all containers. Writes isolated per container. No full filesystem copy on start.

**Say this:** "This is the *entire reason* containers are practical. If you copied the entire Ubuntu image for every container, you'd need terabytes of disk and seconds of boot time. Instead? Fractions of megabytes, milliseconds. OverlayFS is magic."

#### [LAB] Inspect the overlay mount of a running container

**Goal:** Inspect the overlay mount backing a running container's writable filesystem.

1. Start a task - get a real container running so it has a live overlay mount: `sudo ctr run -d docker.io/library/nginx:latest overlay-lab`
2. Find its snapshot key - the snapshot key ties the container to its overlay directories: `sudo ctr snapshots list`
3. See the real mount line - this is the actual lowerdir=/upperdir=/workdir= the kernel is using, not a diagram: `mount | grep overlay`
4. Write inside the container - any write from inside the container lands in upperdir on the host, never touching the shared lowerdir layers: `sudo ctr tasks exec --exec-id write-test -t overlay-lab /bin/sh -c "echo hello > /lab-proof.txt"`
5. **Verify:** the new file shows up in upperdir on the host - proof that writes are isolated per container and lowerdir stays read-only: `sudo find /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/ -name lab-proof.txt`

---

### Lesson: Content-Addressable Storage (`content-cas`)

**Say this:** "OverlayFS handles the *runtime* view. But where do those layers actually live on disk? Content-Addressable Storage. It's like a content library with SHA256 addresses instead of Dewey Decimal numbers."

---

#### List: Benefits

1. **Integrity:** detect corruption/tampering via sha256
   - "If a layer's hash doesn't match, it's corrupted. No guessing, no 'maybe.'"

2. **Deduplication:** shared layers stored once
   - "Ubuntu 20.04 and 22.04 share the same base layer. Store it once, reference it twice."

3. **Efficient transfer:** only missing layers downloaded
   - "Pulling ubuntu:22.04 after ubuntu:20.04? Only the diff layers download. Minutes to seconds."

4. **Reproducibility:** same content = same hash
   - "Build the same image twice, get the same hash. Auditable, traceable, debuggable."

**Say this:** "Content-addressable storage turns images into *math*. Same input always produces same output. That's beautiful."

---

#### Commands: CAS in Action

```bash
# Pull ubuntu:20.04 (downloads all layers)
nerdctl pull ubuntu:20.04

# Pull ubuntu:22.04 (reuses shared base layers!)
nerdctl pull ubuntu:22.04
# note: shared base layers only stored once

# See how much disk is actually consumed
sudo du -sh /var/lib/containerd/

# List all content blobs (by hash)
sudo ctr content list

# Get metadata about a specific blob
sudo ctr content info sha256:abc123...

# Tag content with labels for garbage collection protection
sudo ctr content label sha256:abc123... mylabel=value

# Delete a blob (DANGEROUS - can break images!)
sudo ctr content delete sha256:abc123...
# note: dangerous - can break images
```

**Demo Output (example):**
```bash
$ sudo du -sh /var/lib/containerd/
2.3G    /var/lib/containerd/

$ sudo ctr content list | head
DIGEST                                                                  SIZE       COMMITTED   UPDATED
sha256:d5c1b0ed2a5f1d88b82a14e4e37f1f8...                           5.2MB       true        2024-07-18T10:32:01Z
sha256:e2c8e6fbc8e4f7d3a1b9c2e5f8a0b1c...                           12.4MB      true        2024-07-18T10:32:15Z
```

**Say this:** "Run `ctr content list` and you're seeing the *actual files* on disk, organized by hash. Each blob is one layer, one config, one file. Immutable. Shared. Efficient."

#### Callout: BoltDB - the Metadata Source of Truth (info)

> All daemon-level metadata - images, containers, tasks, namespaces, snapshot leases - lives in a single embedded BoltDB key-value database file, typically `/var/lib/containerd/io.containerd.metadata.v1.bolt/meta.db`. That's what containerd consults to know what exists. The content-addressable blob store above is a separate thing - it holds the actual bytes, not the bookkeeping.

**Say this:** "Quick distinction while we're here: the blobs we just talked about are the *bytes*. BoltDB is the *bookkeeping* - it's how containerd knows which images, containers, and tasks exist at all, completely separate from where their bytes live. We'll see this file again in the Production Ops storage layout."

---

## Module: OCI Spec & Runtimes

### Lesson: OCI Runtime Spec (`oci-spec`)

**Say this:** "OCI—Open Containers Initiative—defined a *standard* for how containers should work. containerd generates OCI bundles and passes them to a runtime. The runtime is just a program that reads the config and makes it happen."

---

#### Text Block

"OCI defines Runtime Spec, Image Spec, and Distribution Spec. containerd generates an OCI config.json; the low-level runtime consumes it."

**The Analogy:** OCI is like a *recipe card*. containerd is the *chef* who reads the card. runc is the *kitchen* that executes it. gVisor and Kata are *specialized kitchens* for different dishes (untrusted code, strong isolation).

---

#### List: config.json Typically Covers

1. **process args/env/cwd/user**
   - What binary to run, with what args? What environment variables? What user? Working directory?

2. **linux.namespaces (pid, network, mount, uts, ipc, user)**
   - Which namespaces to create? Shared or isolated? This defines the "isolation boundary."

3. **mounts (rootfs, proc, sys, binds)**
   - What filesystems to mount inside the container? Rootfs (from snapshotter), proc, sys, bind mounts from host?

4. **linux.capabilities (bounding/effective/permitted)**
   - Which Linux capabilities does the process have? Drop CAP_NET_RAW? Keep CAP_SYS_ADMIN?

5. **linux.seccomp profile**
   - Which syscalls are allowed? Deny dangerous ones like `open_by_handle_at`?

6. **linux.resources (cgroup limits)**
   - CPU limit? Memory limit? PIDs limit? Bandwidth? Throttle IO?

**Say this:** "That config.json file is *everything* about how your container runs. It's JSON, it's portable, and it's the bridge between containerd and runc."

---

#### Commands: runc Flow (Educational)

```bash
# Generate a default config.json in current directory
runc spec

# Create container (prepare namespaces, cgroups, rootfs, but don't start init)
runc create myctr

# Start the container (exec init process)
runc start myctr

# Check current state
runc state myctr

# Clean up
runc delete myctr
```

**Say this:** "You can use runc *directly* for learning, but in production, containerd does this for you. runc is the *low-level primitive*."

---

#### Diagram: containerd Path

```
containerd → forks shim → shim execs runc create/start
runc sets up namespaces/cgroups/rootfs → execs init → runc exits
shim stays, holds stdio + exit code + PID file
```

**Say this:** "This architecture is *elegant*:
1. containerd forks a shim (a small Go binary that stays around)
2. shim execs runc (which does the heavy lifting)
3. runc sets up isolation and execs your init
4. runc exits (its job is done)
5. shim survives, keeping stdio and metadata alive
6. If your container hangs, runc already exited—no zombie runc process
7. If the daemon crashes, the shim survives—your container keeps running"

#### [LAB] Generate a config.json and compare it to containerd's

**Goal:** Generate a default OCI config.json and find where containerd's generated version differs.

1. Generate a default spec - runc alone, no containerd involved, this is the raw OCI runtime spec baseline: `mkdir -p /tmp/lab-bundle && cd /tmp/lab-bundle && runc spec`
2. Inspect the baseline - look at process.args, linux.namespaces, and linux.capabilities, this is the minimum OCI spec: `cat /tmp/lab-bundle/config.json`
3. Start a real containerd task - containerd generates its own config.json per task, richer than the runc default: `sudo ctr run -d docker.io/library/nginx:latest spec-lab`
4. Find containerd's generated bundle - every running task has a bundle dir with its own config.json under the runtime state path: `sudo find /run/containerd/io.containerd.runtime.v2.task/ -name config.json`
5. **Verify:** both files are valid OCI runtime spec JSON with process/root/linux.namespaces sections, but containerd's version has mounts, cgroup paths, and a rootfs pointing at the real overlay snapshot - the runc default is just a skeleton: `cat /run/containerd/io.containerd.runtime.v2.task/default/spec-lab/config.json`

---

### Lesson: Alternative Runtimes (`alt-runtimes`)

**Say this:** "runc is the default because it's fast and practical. But what if you want *more* isolation? Or different tradeoffs? Plug in a different runtime."

---

#### Table: Runtime Comparison

| Runtime | Isolation | Performance | Startup | Use case |
|---|---|---|---|---|
| runc | Namespaces | Fastest | <50ms | General purpose |
| gVisor (runsc) | User-space kernel / syscall intercept | Good | ~200ms | Untrusted workloads |
| Kata | Lightweight VM | Good | ~500ms | Strong isolation |
| Firecracker | MicroVM | Good | ~125ms | Serverless |

**Say this:** "
- **runc:** The default. Fast. Lightweight. Uses OS namespaces/cgroups.
- **gVisor:** Intercepts syscalls in userspace. Slower, but bulletproof isolation. Untrusted code? Use gVisor.
- **Kata:** Boots a full VM for each container. Heavy. But unbreakable isolation.
- **Firecracker:** Optimized for serverless. Tiny VMs. AWS uses this.
"

---

#### Commands: Run with Specific Runtime

```bash
# Run with default runc
nerdctl run --runtime=runc nginx

# Run with gVisor (userspace kernel)
nerdctl run --runtime=runsc nginx
# note: gVisor

# Run with Kata (lightweight VM)
nerdctl run --runtime=kata nginx

# Run with Firecracker (serverless microvms)
nerdctl run --runtime=firecracker nginx

# Check installed runtime plugins
sudo ctr plugins list | grep runtime

# Lower-level: ctr run with gVisor
sudo ctr run --runtime io.containerd.runsc.v1 docker.io/library/alpine:latest secure-container echo "gVisor"

# Lower-level: ctr run with Kata
sudo ctr run --runtime io.containerd.kata.v2 docker.io/library/nginx:latest kata-web
```

**Say this:** "Want to use gVisor for that sketchy third-party app, but runc for your trusted services? Mix and match in the same cluster. That's the power of pluggable runtimes."

---

## Module: Security

### Lesson: Capabilities, seccomp, MAC, Rootless (`sec-stack`)

**Say this:** "Security isn't one thing. It's *layers*. Like a medieval castle: walls, moat, guards, secret passages. Each layer stops a different attack."

---

#### Cards: Security Layers

**Card 1: Linux Capabilities**
- **Title:** Linux Capabilities
- **Tag:** caps (yellow)
- **Body:** containerd/runc drop dangerous caps by default (e.g. CAP_NET_RAW often restricted). Least privilege at process level.
- **Analogy:** Instead of "root = god," capabilities say "this process can bind to ports, but not reboot the system." Fine-grained permission slicing.

**Card 2: seccomp**
- **Title:** seccomp
- **Tag:** syscalls (red)
- **Body:** Syscall allow-list loaded via OCI spec. Blocks dangerous syscalls even if process is root in container.
- **Analogy:** The kernel's bouncer. "You're root? Cool. But you can't call `ptrace()` or `load_module()` anyway." Even root can't do everything.

**Card 3: AppArmor / SELinux**
- **Title:** AppArmor / SELinux
- **Tag:** MAC (orange)
- **Body:** Mandatory access control profiles applied at task start - confines file/network operations.
- **Analogy:** Legal contracts vs. passwords. Even if you *know* the password, the MAC profile says "no, you can't read that file." Mandatory, not discretionary.

**Card 4: Rootless**
- **Title:** Rootless
- **Tag:** rootless (green)
- **Body:** UID 0 inside maps to unprivileged host UID via user namespaces - reduce host blast radius.
- **Analogy:** Even if someone breaks out of the container, they're just an unprivileged user on the host. They can't reboot. They can't escalate. Contained.

**Say this:** "Each layer is independent. If one fails, the others catch you. That's defense in depth."

---

#### [DEMO] VisualSecurityLayers (`demoId: VisualSecurityLayers`)

**Demo Description:**
A concentric shield visualization with layers radiating outward:
- Center: Container process (small dot)
- Ring 1: Capabilities (yellow, labeled "caps")
- Ring 2: seccomp (red, labeled "syscalls")
- Ring 3: MAC (orange, labeled "AppArmor/SELinux")
- Ring 4: Rootless (green, labeled "user ns")
- Ring 5: cgroups (blue, labeled "resource limits")

A "Simulate Attack" button triggers a projectile that bounces off each layer:
- Try to call a forbidden syscall → bounces off seccomp
- Try to read a forbidden file → bounces off MAC
- Try to escalate to real root → bounces off user ns
- Try to use all memory → bounces off cgroups

Visual, fun, immediate feedback on defense in depth.

---

#### List: Security Wins of the Architecture

1. **Smaller attack surface than full Docker Engine path**
   - containerd is ~1 million lines of code vs Docker's multi-million. Less code = fewer bugs.

2. **Plugin isolation boundaries**
   - A buggy snapshotter plugin doesn't crash the whole daemon. Plugins can be sandboxed.

3. **Multi-runtime: escalate isolation (gVisor/Kata) per workload**
   - Untrusted code gets gVisor. Trusted code gets fast runc. No one-size-fits-all.

4. **Image encryption for registry-at-rest confidentiality**
   - Encrypt layers before pushing to registry. Registry can't see your secrets.

**Say this:** "containerd wasn't designed to be the most featureful. It was designed to be the most *secure and trustworthy*. Every decision is 'what's the simplest, safest way to do this?'"

---

#### Callout: Mental Model (warn)

**Body:**
Isolation is layered: user ns + mount ns + net ns + cgroups + caps + seccomp + MAC (+ optional VM sandbox). containerd wires these via OCI; kernel enforces them.

**Say this:** "When someone asks 'is containerd secure?', the answer is 'secure from what?' A namespaced container running runc is secure from other containers. A rootless container is more secure from the host. A gVisor container is more secure from the kernel. Each layer answers a different threat. Think in terms of threat models, not absolutes."

#### Callout: What Are cgroups? (info)

> cgroups (control groups) are a Linux kernel mechanism that groups processes together and limits, accounts for, and isolates their collective use of a resource - CPU, memory, disk I/O, network. A container's "--memory" and "--cpu" limits are just cgroup settings applied to the task's process group; the kernel enforces the ceiling, containerd only configures it via the OCI spec.

**Say this:** "We keep saying 'cgroups' like everyone knows what it means. Here it is plainly: it's the kernel feature that actually enforces resource limits. containerd just writes the settings into config.json - the kernel does the enforcing."

#### [LAB] Verify seccomp/capability restrictions are actually enforced

**Goal:** Verify the seccomp and capability restrictions actually applied to a running task, not just documented.

1. Start a task normally - default security profile, no special flags: `sudo ctr run -d docker.io/library/alpine:latest sec-lab`
2. Try a gated operation - setting the system clock needs CAP_SYS_TIME and is also blocked by the default seccomp profile, expect it to fail even though the process is root inside the container: `sudo ctr tasks exec --exec-id sec-test -t sec-lab date -s "2020-01-01"`
3. Confirm root inside is not root outside - the process shows uid 0 inside the container, but the operation above still failed: `sudo ctr tasks exec --exec-id whoami-test sec-lab whoami`
4. **Verify:** the gated operation returned a permission/operation-not-permitted error - the security layers are actively enforced by the kernel, not just described in a slide: `sudo ctr tasks exec --exec-id sec-test2 -t sec-lab date -s "2020-01-01"; echo "exit code: $?"`

---

## Module: Debugging Toolkit

### Lesson: Seven Steps (no Docker required) (`debug-seven`)

**Say this:** "Your container isn't starting. Your app is crashing. You can't SSH in. What do you do? These seven steps will debug 90% of container problems. No Docker required. Just containerd CLI."

---

#### [DEMO] DemoDebugFlow (`demoId: DemoDebugFlow`)

**Demo Description:**
An interactive flowchart where you pick a scenario (container not starting, container exited, app unresponsive, high memory, etc.). Each path walks through the seven steps, showing real commands and output at each stage. Click to execute a step, see the output, move to the next. Real, runnable debugging workflow.

---

#### Steps: The Seven Debug Steps

**Step 1: Get Task PID**
- **Title:** 1. Get task PID
- **Detail:** Host PID of the container init - every later step uses it
- **Command:** `sudo ctr tasks list`
- **Why it matters:** Without the PID, you can't do anything else. This is the root of debugging.
- **Example output:**
  ```
  TASK                    PID      STATUS      NAMESPACE
  my-nginx                2547     RUNNING     k8s.io
  my-redis                3891     RUNNING     k8s.io
  ```
- **Say this:** "That PID is gold. It's the host-side entry point to your container. Keep it."

**Step 2: Inspect Namespaces**
- **Title:** 2. Inspect namespaces
- **Detail:** Same inode number under /proc/*/ns = same namespace
- **Command:** `ls -la /proc/<PID>/ns/`
- **Why it matters:** Namespaces are the *isolation boundary*. If inode numbers match, containers share that namespace (expected for shared namespace scenarios, red flag otherwise).
- **Example output:**
  ```
  lrwxr-xr-x 1 root root 0 Jul 18 10:32 cgroup -> cgroup:[4026532509]
  lrwxr-xr-x 1 root root 0 Jul 18 10:32 ipc -> ipc:[4026532510]
  lrwxr-xr-x 1 root root 0 Jul 18 10:32 mnt -> mnt:[4026532511]
  lrwxr-xr-x 1 root root 0 Jul 18 10:32 net -> net:[4026532512]
  lrwxr-xr-x 1 root root 0 Jul 18 10:32 pid -> pid:[4026532513]
  lrwxr-xr-x 1 root root 0 Jul 18 10:32 user -> user:[4026531837]
  lrwxr-xr-x 1 root root 0 Jul 18 10:32 uts -> uts:[4026532514]
  ```
- **Say this:** "Each number is a namespace. If two containers have the same inode, they share that namespace. That's your isolation check."

**Step 3: nsenter Into Namespaces**
- **Title:** 3. nsenter into namespaces
- **Detail:** See network/pid/mount/uts exactly as the container sees them
- **Command:** `sudo nsenter -t <PID> --net --pid --mount --uts /bin/sh`
- **Why it matters:** You're now *inside* the container's namespace bubble. Everything the container sees, you see. Try to debug network issues? You'll see the container's network stack, not the host's.
- **Example use case:**
  ```bash
  # Container can't resolve DNS? Jump in and test:
  sudo nsenter -t 2547 --net /bin/sh
  # Inside: nslookup google.com
  # See what the container sees
  ```
- **Say this:** "This is your first 'get inside the container' tool. No SSH required. No Docker required. Just namespaces."

**Step 4: ctr Tasks Exec**
- **Title:** 4. ctr tasks exec
- **Detail:** Same namespaces + cgroups + security profile as the task
- **Command:** `sudo ctr tasks exec --exec-id debug -t my-container /bin/sh`
- **Why it matters:** Like `docker exec`, but lower-level. It respects ALL the container's isolation/security settings. You get a shell that's *authentically* inside the container.
- **Example:**
  ```bash
  sudo ctr tasks exec --exec-id debug1 -t my-nginx /bin/sh
  # Inside: ps aux (see only container processes)
  # Inside: env (see container's env vars)
  # Inside: netstat (see container's network)
  ```
- **Say this:** "This is `docker exec` territory. But with full containerd control."

**Step 5: Stream Events**
- **Title:** 5. Stream events
- **Detail:** task start/exit, OOM, snapshot ops in real time
- **Command:** `sudo ctr events`
- **Why it matters:** Watch what's happening as it happens. Container exited? You'll see the `TaskExit` event with exit code. Memory explosion? You'll see the OOM event.
- **Example output:**
  ```
  time="2024-07-18T10:32:45.123456Z" type="task" id="my-nginx" state="running"
  time="2024-07-18T10:32:50.654321Z" type="task" id="my-nginx" state="exited" exitStatus=1
  ```
- **Say this:** "Run this in a terminal. Leave it. When weird things happen, you'll *see* them in real time. It's like wiretapping your container."

**Step 6: Daemon Logs**
- **Title:** 6. Daemon logs
- **Detail:** pull failures, snapshot errors, shim exits
- **Command:** `journalctl -u containerd -f`
- **Why it matters:** When the daemon itself has problems, they log here. Pull failed? Image corruption? Snapshotter crashed? All here.
- **Example:**
  ```
  Jul 18 10:32:45 myhost containerd[1234]: time="2024-07-18T10:32:45.123Z" level=info msg="PullImage"
  Jul 18 10:32:50 myhost containerd[1234]: time="2024-07-18T10:32:50.456Z" level=error msg="pull failed" err="unauthorized"
  ```
- **Say this:** "This is the daemon's inner monologue. If containerd is confused, you'll hear about it here."

**Step 7: Inspect Overlay Mounts**
- **Title:** 7. Inspect overlay mounts
- **Detail:** Read upperdir files without entering the container
- **Command:** `mount | grep overlay`
- **Why it matters:** You can walk the filesystem hierarchy *directly* without entering the container. See what's in upperdir (container's writes). Compare to lowerdir (image). No shell required.
- **Example:**
  ```
  overlay on /run/containerd/io.containerd.runc.v2.task/...
    lowerdir=/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/1/fs
    upperdir=/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/2/fs
    workdir=/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/2/work

  # Now you can:
  ls /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/2/fs/
  # See container's writes directly
  ```
- **Say this:** "This is surgical debugging. You can inspect container state *without* entering the container. Read files, check permissions, see what changed. All from the host."

---

#### Commands: Extra Debug Tools

```bash
# CPU, memory, IO, PID stats for a task
sudo ctr tasks metrics my-nginx

# Processes running inside the task (like 'ps' inside container)
sudo ctr tasks ps my-nginx

# Full container config and metadata
sudo ctr containers info my-nginx

# Pull with debug logging enabled
sudo ctr --debug images pull docker.io/library/nginx:latest

# Containerd daemon status
sudo systemctl status containerd

# note: CPU / memory / IO / PIDs
# note: processes inside task
# note: (no explicit note for containers info or debug pull, but included)
# note: (no explicit note, but included)
```

---

#### Code: Health Check Script

**Title:** Health check script (from ctr1.md)

```bash
#!/bin/bash
echo "=== ContainerD Health Check ==="
systemctl is-active --quiet containerd && echo "containerd running" || exit 1
sudo ctr version
FAILED=$(sudo ctr plugins list | grep -c error || true)
echo "failed plugins: $FAILED"
echo "namespaces: $(sudo ctr namespaces list | grep -v NAME | wc -l)"
echo "tasks: $(sudo ctr tasks list | grep -v TASK | wc -l)"
echo "images: $(sudo ctr images list | grep -v REF | wc -l)"
echo "disk: $(sudo du -sh /var/lib/containerd 2>/dev/null | cut -f1)"
```

**Say this:** "Cron this script every 5 minutes. You'll know immediately if containerd dies, if plugins fail, or if disk space explodes."

#### [LAB] Run the full 7-step debug flow end to end

**Goal:** Reach a real task's filesystem and process tree from the host, using only the 7 steps above - no docker exec, no high-level client.

1. Get task PID - every later step depends on this PID: `sudo ctr tasks list`
2. Inspect namespaces - confirm the namespace inode numbers under /proc/<PID>/ns/: `ls -la /proc/<PID>/ns/`
3. nsenter - drop into the exact namespaces the container sees: `sudo nsenter -t <PID> --net --pid --mount --uts /bin/sh`
4. ctr tasks exec (alternative path) - same namespaces + cgroups + security profile, via containerd instead of nsenter: `sudo ctr tasks exec --exec-id debug -t my-container /bin/sh`
5. Stream events - confirm the daemon sees this task as healthy in real time: `sudo ctr events`
6. Daemon logs - rule out pull/snapshot/shim errors at the daemon level: `journalctl -u containerd -f`
7. Inspect overlay mounts - read the container's files directly from the host, no shell inside required: `mount | grep overlay`
8. **Verify:** you reached the container's process and filesystem entirely through host tools (nsenter/ctr/mount) - no docker exec, no dashboard - proving containerd needs no high-level client to be debuggable: `echo "debugged without docker"`

---

## Module: Production Ops

### Lesson: config.toml Deep Dive (`prod-config`)

**Say this:** "Production is where theory meets reality. Your config.toml is the truth table. Get it wrong, and your whole fleet breaks."

---

#### Callout: Generate Defaults (tip)

**Body:**
If missing: `sudo containerd config default > /etc/containerd/config.toml` then restart containerd.

**Say this:** "Never hand-craft config.toml from scratch. Always start from the defaults and *edit* them. The defaults are tested and stable."

---

#### Code: /etc/containerd/config.toml (Essential Structure)

```toml
version = 2
root = "/var/lib/containerd"
state = "/run/containerd"
oom_score = -999

[grpc]
  address = "/run/containerd/containerd.sock"
  uid = 0
  gid = 0
  max_recv_message_size = 16777216
  max_send_message_size = 16777216

[debug]
  address = "/run/containerd/debug.sock"
  level = "info"  # trace, debug, info, warn, error, fatal

[metrics]
  address = "127.0.0.1:1338"
  grpc_histogram = false

[plugins."io.containerd.grpc.v1.cri"]
  sandbox_image = "registry.k8s.io/pause:3.9"

  [plugins."io.containerd.grpc.v1.cri".containerd]
    snapshotter = "overlayfs"
    default_runtime_name = "runc"

    [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
      runtime_type = "io.containerd.runc.v2"
      [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
        SystemdCgroup = true

    [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runsc]
      runtime_type = "io.containerd.runsc.v1"

  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
    endpoint = ["https://registry-1.docker.io"]
```

**Section-by-section:**

- **version = 2**: Use config version 2 (newer, better).
- **root**: Where images, snapshots, content live. Usually `/var/lib/containerd`.
- **state**: Runtime state. Usually `/run/containerd`.
- **oom_score = -999**: Tell kernel "if you're OOM killing, kill this daemon last." Protection.
- **[grpc]**: The gRPC socket that clients connect to. Address, permissions, message size limits.
- **[debug]**: Debug socket and log level. `trace` = verbose, `info` = normal, `error` = quiet.
- **[metrics]**: Prometheus metrics endpoint. Usually `127.0.0.1:1338`. Scrape this for dashboards.
- **[plugins."io.containerd.grpc.v1.cri"]**: CRI plugin (what Kubernetes talks to).
  - **sandbox_image**: The pause container image. Kubernetes requirement.
  - **snapshotter**: overlayfs, btrfs, etc.
  - **default_runtime_name**: runc, runsc, kata, etc.
  - **runtimes.runc**: Configure runc runtime. `SystemdCgroup = true` tells runc to use systemd for cgroups (required on systemd systems).
  - **runtimes.runsc**: gVisor runtime config (if you have it installed).
  - **registry.mirrors.docker.io**: Redirect docker.io to a different registry (e.g., corporate mirror).

**Say this:** "This is the *entire configuration*. Every line does something. Change `default_runtime_name` to `kata` and all containers boot as VMs. Change `snapshotter` to `btrfs` and you're using btrfs snapshots. It's that powerful."

---

#### List: Three Files That Matter in Prod

1. **config.toml** - daemon behavior, plugins, GC, metrics, runtimes
   - Where?  `/etc/containerd/config.toml`
   - What? Global daemon config. Snapshotter, runtimes, logging, metrics.

2. **hosts.toml per registry under certs.d** - auth, mirrors, TLS
   - Where? `/etc/containerd/certs.d/my-registry.example.com/hosts.toml`
   - What? Per-registry auth, mirrors, TLS certs. One file per registry.

3. **Runtime/shim config** - alternative runtimes (gVisor/Kata)
   - Where? Varies. Usually `/etc/containerd/runtimes.d/` or inline in config.toml.
   - What? Configuration for gVisor, Kata, or other runtimes. Not often needed for basic runc.

**Say this:** "Ninety percent of your config issues will be in config.toml. Ninety percent of your auth issues will be in hosts.toml. Keep both handy."

---

### Lesson: GC, Metrics, Private Registry (`prod-gc-metrics-reg`)

**Say this:** "You've got containers running. But are they *healthy*? How much disk? What's the CPU? And when do old images get cleaned up? Welcome to production ops."

---

#### Text: Garbage Collection

**Title:** Garbage collection
**Body:** containerd does not always delete unused images/snapshots immediately. GC runs by policy/thresholds; unused content can linger until GC. Monitor disk under /var/lib/containerd.

**Say this:** "Garbage collection is *lazy*. If you delete a container and pull a new image, containerd doesn't immediately delete the old snapshot. It waits. Why? Because maybe you'll recreate the container in 5 seconds. GC runs on a schedule or when space runs low. Monitor disk. Don't assume deleted = freed."

---

#### Commands: Metrics

```bash
# Prometheus endpoint (enable in config.toml)
curl http://localhost:1338/v1/metrics
# note: Prometheus endpoint (enable in config.toml)
```

**Example output (snippet):**
```
# HELP containerd_containers_count Number of containers
# TYPE containerd_containers_count gauge
containerd_containers_count{namespace="k8s.io"} 42

# HELP containerd_images_count Number of images
# TYPE containerd_images_count gauge
containerd_images_count{namespace="k8s.io"} 18

# HELP containerd_task_cpu_total_seconds CPU seconds used
# TYPE containerd_task_cpu_total_seconds counter
containerd_task_cpu_total_seconds{container_id="my-nginx"} 123.45

# HELP containerd_task_memory_usage_bytes Memory usage
# TYPE containerd_task_memory_usage_bytes gauge
containerd_task_memory_usage_bytes{container_id="my-nginx"} 67108864
```

**Say this:** "Scrape this endpoint every 30 seconds and feed it to Prometheus. Graph the metrics. Set alerts. Now you'll *see* when things go wrong before your users do."

---

#### List: Sample Metrics

1. **containerd_containers_count** - Total running containers
2. **containerd_images_count** - Total downloaded images
3. **containerd_task_cpu_total_seconds** - CPU usage per task
4. **containerd_task_memory_usage_bytes** - Memory per task

**Say this:** "These four metrics are your MVP. Graph them. Alert if containers count drops (signs of mass failures) or memory climbs (leaks). That's 80% of production monitoring right there."

---

#### Code: Private Registry hosts.toml

**Title:** Private registry hosts.toml sketch

```toml
# /etc/containerd/certs.d/my-registry.example.com/hosts.toml
server = "https://my-registry.example.com"

[host."https://my-registry.example.com"]
  capabilities = ["pull", "resolve", "push"]
  # ca = "/etc/containerd/certs.d/my-registry.example.com/ca.crt"
  # [host."https://my-registry.example.com".header]
  #   authorization = "Basic <base64>"
```

**Breakdown:**

- **server**: The registry URL.
- **[host."https://my-registry.example.com"]**: Config for that host.
  - **capabilities**: What operations are allowed? `pull`, `resolve`, `push`.
  - **ca**: (commented) Path to CA cert if using self-signed TLS.
  - **header**: (commented) HTTP headers, e.g., auth tokens.

**Say this:** "Create one hosts.toml per private registry you use. Uncomment the `ca` and `authorization` lines to add TLS certs and auth tokens. This is how you pull from private registries without `docker login` magic."

---

#### Commands: Leases (Protect Content from GC)

```bash
# List all active leases
sudo ctr leases list

# Create a new lease (protects content from GC)
sudo ctr leases create my-lease

# Add content to a lease (keeps it safe)
sudo ctr leases add my-lease <resource>

# Delete a lease (content can now be GC'd)
sudo ctr leases delete my-lease
```

**Say this:** "Leases are a GC protection mechanism. 'I'm pulling a huge image. Don't GC it halfway through.' Create a lease, add resources to it, release the lease when done. Without a lease, GC might delete your layer while you're still downloading it."

#### [LAB] Run GC and confirm unreferenced content is reclaimed

**Goal:** Run garbage collection and confirm unreferenced content is actually reclaimed from disk.

1. Pull an image - creates fresh, referenced content-store blobs: `sudo ctr images pull docker.io/library/alpine:latest`
2. Check disk usage - baseline before removing anything: `sudo du -sh /var/lib/containerd/io.containerd.content.v1.content/`
3. Remove the image reference only - this drops the tag/reference but the underlying blobs aren't deleted immediately, they become unreferenced, not gone: `sudo ctr images rm docker.io/library/alpine:latest`
4. Confirm blobs still linger - containerd doesn't always delete unused content immediately, it waits for GC: `sudo ctr content list`
5. Trigger GC - forces containerd to reclaim anything with no live reference or lease: `sudo ctr namespaces list && sudo systemctl reload containerd`
6. **Verify:** disk usage of the content store drops and the orphaned blobs no longer show up in `ctr content list` - proof GC actually reclaimed them rather than just marking them: `sudo du -sh /var/lib/containerd/io.containerd.content.v1.content/ && sudo ctr content list`

---

### Lesson: Full Storage Layout (`prod-storage-layout`)

**Say this:** "What's actually on disk? Where does everything live? This is the treasure map."

---

#### Tree: Full Directory Structure

```
/var/lib/containerd/
├── io.containerd.content.v1.content/
│   ├── blobs/sha256/   # layers + configs by hash
│   └── ingest/         # temp downloads
├── io.containerd.snapshotter.v1.overlayfs/
│   ├── snapshots/1|2|3/fs
│   └── metadata.db
├── io.containerd.metadata.v1.bolt/meta.db
└── (runtime state often under /run/containerd/...)
```

**Breakdown:**

- **io.containerd.content.v1.content/blobs/sha256/**
  - Every image layer, config, and blob. Organized by SHA256 hash.
  - Example: `sha256/d5c1b0ed2a5f1d88b82a14e4e37f1f8abc123def456...`
  - Immutable. Multiple containers reference the same blob.

- **io.containerd.content.v1.content/ingest/**
  - Temporary downloads. In-progress pulls. Cleaned up when pull finishes (or fails).

- **io.containerd.snapshotter.v1.overlayfs/snapshots/1|2|3/fs**
  - Each snapshot is a directory. `1/fs`, `2/fs`, etc.
  - Directories contain actual files (image layers or container upperdirs).

- **io.containerd.snapshotter.v1.overlayfs/metadata.db**
  - SQLite database mapping snapshot IDs to parent chains, labels, metadata.

- **io.containerd.metadata.v1.bolt/meta.db**
  - BoltDB key-value store. All daemon metadata. Containers, images, tasks, namespaces. The source of truth.

- **(/run/containerd/...)**
  - Runtime state. Sockets, PIDs, temporary files. Cleaned on daemon restart.

**Say this:** "If you need to recover a deleted image, the blobs might still be in `/var/lib/containerd/io.containerd.content.v1.content/blobs/`. If a container is stuck, check `/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/` for orphaned directories. If the daemon won't start, the metadata.db might be corrupted—backup and rebuild. This tree is your emergency manual."

---

## WRAP-UP: Key Takeaways

**Say this to close:**

"Part 2 is about *implementation*. You now know:

1. **Snapshots & OverlayFS**: How image layers become cheap, instant containers. No copying. Copy-on-write. Genius.

2. **Content-Addressable Storage**: Every layer is a hash. Same content = same hash. Deduplication works. Integrity guaranteed.

3. **OCI Spec & Runtimes**: containerd is just a *coordinator*. runc is the *executor*. Plug in gVisor or Kata, and isolation changes—same API.

4. **Security**: Not one mechanism, but *layers*. Namespaces, capabilities, seccomp, MAC, rootless. Each layer catches different attacks.

5. **Debugging**: Seven steps. No magic. Just systematics. PID → namespaces → nsenter → exec → events → logs → mounts. Debug anything.

6. **Production Ops**: Three files. One config. One metrics endpoint. One dashboard. Scale it up.

You're no longer using containerd. You're *reasoning* about containerd. You understand the architecture. You can debug issues. You can tune for performance. You can add security. That's the power of understanding internals.

Welcome to Part 3, where we build things *with* containerd!"

---

## ASCII Art Reference (Optional, for slides)

```
   ___  _________ _____
  / _ \ \ __  __// ____\
 / /_\ \ _\ \/ / / __
/ _ | \ \\/  \/ / \_ \
\/ \_| \_/\_/\_/ \____/

OverlayFS

┌──────────────────────────┐
│  merged (unified view)   │  ← what container sees
├──────────────────────────┤
│  upperdir (rw, container)│  ← container's writes
├──────────────────────────┤
│  lowerdir (ro, image)    │  ← parent layers
├──────────────────────────┤
│  workdir (kernel temp)   │  ← CoW staging
└──────────────────────────┘

LAYERS DIAGRAM

Image: ubuntu:22.04
├─ base (1GB) ─── shared
├─ runtime (200MB) ── shared
├─ app (50MB)
└─ config (1MB)

Container 1  Container 2  Container 3
  ├─ upper       ├─ upper       ├─ upper
  │ (1MB)        │ (2MB)        │ (3MB)
  └─ (all layers shared below)

Result: 1GB + 200MB + 50MB + 1MB + 1MB + 2MB + 3MB = 1.25GB total
(not 3GB per container!)
```

---

END OF PART 2 TEACHING NOTES
# DETAILED TEACHING NOTES: PART 3 & 4 · The containerd Masterclass

---

# PART 3 · ctr CLI

## Module: ctr Philosophy & Concepts

### Lesson: What is ctr? (`ctr-what`)

**Say this:** "Okay, so you want to peek under the hood of containerd without the fancy UI. That's where `ctr` comes in. It's not here to make your life easy—it's here to show you *exactly* what containerd is doing."

**Key Concept:**
ctr is the official CLI client for containerd - a debugging and admin tool with direct API mapping. Think diagnostic port, not dashboard.

**Analogy Time:**
If Docker is your car's dashboard with pretty speedometer and fuel gauge, then `ctr` is the mechanic's diagnostic scanner. You don't drive with it daily, but when something's wrong, you plug it in and see what the engine is *really* doing.

#### Compare Block: USE ctr when vs DON'T use ctr when

**USE ctr when:**
- Debugging containerd itself
- Learning internals (images vs containers vs tasks)
- Scripting low-level ops
- Testing containerd without Docker
- Working with namespaces explicitly

**DON'T use ctr when:**
- Daily app development → nerdctl/docker
- Need Compose → docker/nerdctl compose
- Need build → docker/nerdctl build
- Want friendly UX → nerdctl
- Managing K8s apps → kubectl + crictl

#### Diagram: The Stack

```
docker / nerdctl / kubectl   = driving dashboard
ctr / crictl                 = mechanic diagnostic tool
containerd                   = the engine
```

**Say this:** "See the layers? Your user-facing tools (docker, nerdctl, kubectl) are the pretty dashboard. The diagnostic tools (ctr, crictl) are for power users and maintainers. And containerd—the actual engine—is handling everything underneath."

#### Callout: Design Philosophy

> **Design philosophy:** Minimal, explicit, verbose. Direct mapping to APIs. Intentionally not user-friendly - it was never meant to be Docker.

**Say this:** "ctr doesn't hold your hand. It was designed by engineers, for engineers who want to understand how containerd actually works. No shortcuts, no magic abbreviations (mostly). Just you and the API."

---

### Lesson: Core Concepts for ctr (`ctr-concepts`)

[DEMO] DemoContainerVsTask

**Say this:** "Now, before we start typing commands, there's something fundamental you need to grok. Docker blurs the line between images, containers, and running processes. containerd? It splits them apart. And that's actually *genius* for different use cases."

#### Core Concept Cards

**Card 1: Full image refs** (Red)
- **Tag:** refs
- No Docker shorthand. Always `docker.io/library/nginx:latest` (registry/namespace/image:tag).
- **Say this:** "You can't just `ctr images pull nginx`. containerd doesn't play guessing games. Where's it from? What namespace? What version? Be explicit."

**Card 2: Container ≠ Task** (Yellow)
- **Tag:** split
- Container = metadata. Task = running process with PID. Docker merges them; containerd splits them.
- **Say this:** "This is the mind-bender. In Docker, a 'container' is both the blueprint AND the running thing. Here? Container is just the recipe card. Task is the actual cooking. You can have a container with no task running. Mind. Blown."

**Card 3: Namespaces** (MCB Blue)
- **Tag:** -n
- Every command is namespace-scoped. Default is `default`; K8s uses `k8s.io`; Docker uses `moby`.
- **Say this:** "Think of namespaces as separate universes inside containerd. Your default namespace is one universe. Kubernetes is running in a completely different universe (`k8s.io`). They don't see each other. Docker lives in the `moby` namespace. Total isolation."

**Card 4: Snapshots** (Orange)
- **Tag:** fs
- Images unpack to snapshots; containers get writable snapshots on top.
- **Say this:** "When you pull an image, those layers? They become snapshots in the content store. When you create a container, you get a writable snapshot on top of those read-only layer snapshots. Copy-on-write magic happening invisibly."

#### Commands: Wrong vs Right

**❌ WRONG:**
```bash
sudo ctr images pull nginx
```
**Note:** Missing full reference. ctr will fail because it doesn't know the registry, namespace, or what version you want.

**✅ CORRECT:**
```bash
sudo ctr images pull docker.io/library/nginx:latest
```
**Note:** Full reference with registry, namespace, image name, and tag. This works.

**Say this:** "See the difference? Docker figured out the defaults for you (Docker Hub, library namespace, latest tag). ctr says 'nope, be explicit.'"

#### Commands: Container vs Task Demo

**Step by step—watch the separation:**

```bash
# Step 1: Pull the image (just bytes in the store)
sudo ctr images pull docker.io/library/nginx:latest
```

```bash
# Step 2: Create a container (metadata, no process yet)
sudo ctr containers create docker.io/library/nginx:latest my-nginx
```

```bash
# Step 3: List containers—it's here
sudo ctr containers list
# Output shows: my-nginx | created | false | -
# Note: It's created but nothing is running
```

```bash
# Step 4: Try to list tasks—empty!
sudo ctr tasks list
# Output: TASK    PID    STATUS
# (nothing)
# Note: Empty—no running processes yet
```

```bash
# Step 5: Start a task from that container
sudo ctr tasks start -d my-nginx
```

```bash
# Step 6: List tasks again—now it shows up with a PID
sudo ctr tasks list
# Output:
# TASK       PID      STATUS
# my-nginx   12345    RUNNING
# Note: Now we have a PID! A real process is running!
```

**Say this:** "Do you see what just happened? We pulled an image. We created a container (just metadata). The container wasn't running. Then we started a task, and *that's* when the actual process with a PID appeared. Docker hides this distinction. containerd is brutally honest about it."

#### Code Block: General ctr Syntax

```bash
ctr [global-options] <command> [command-options] [arguments]

# Globals you will use constantly
sudo ctr --namespace=production images list
sudo ctr -n production images list
sudo ctr --address /run/containerd/containerd.sock version
sudo ctr --connect-timeout 30s version
sudo ctr --debug images pull docker.io/library/nginx:latest

# Help
ctr --help
ctr images --help
ctr images pull --help
```

**Say this:** "The syntax is consistent: globals first, then command, then command-options. The `--namespace` or `-n` flag is your most-used global. Always remember: if you don't specify a namespace, you're in the `default` namespace. K8s won't see it."

#### [LAB] Wrong vs right pull, container vs task

**Goal:** Do a wrong-vs-right image pull, then tell a container apart from a task.

1. Wrong pull - try the Docker-style shorthand, ctr has no default registry/namespace, so this fails: `sudo ctr images pull nginx`
2. Right pull - retry with the full reference: registry/namespace/image:tag: `sudo ctr images pull docker.io/library/nginx:latest`
3. Create container - metadata only is written, no process exists yet: `sudo ctr containers create docker.io/library/nginx:latest lab-nginx`
4. Confirm no task yet - the container exists but nothing is running: `sudo ctr tasks list`
5. Start the task - now a real process is spawned for the container: `sudo ctr tasks start -d lab-nginx`
6. **Verify:** tasks list now shows a PID for lab-nginx - proof that container (metadata) and task (running process) are separate objects: `sudo ctr tasks list | grep lab-nginx`

---

## Module: Images Command Reference

### Lesson: Pull, List, Tag, RM, Export/Import, Labels (`ctr-images-all`)

**Say this:** "Images are the foundation. Let's learn how to manipulate them like a pro. Every command here is a power move."

#### Commands: Pull

**Basic pulls:**
```bash
sudo ctr images pull docker.io/library/nginx:latest
# Downloads nginx from Docker Hub, latest version
```

**Version-specific:**
```bash
sudo ctr images pull docker.io/library/nginx:1.25.3
# Gets exactly version 1.25.3, no guessing
```

**Alpine variant:**
```bash
sudo ctr images pull docker.io/library/nginx:alpine
# Lightweight variant, ~150MB instead of 600MB+
```

**Kubernetes-specific image:**
```bash
sudo ctr images pull registry.k8s.io/pause:3.9
# The famous pause image that every K8s pod needs
```

**Platform-specific (amd64):**
```bash
sudo ctr images pull --platform linux/amd64 docker.io/library/alpine:latest
# Explicitly ask for x86-64 architecture
```

**Platform-specific (arm64):**
```bash
sudo ctr images pull --platform linux/arm64 docker.io/library/alpine:latest
# For ARM systems (Macs, Raspberry Pi, EC2 Graviton)
```

**From specific namespace:**
```bash
sudo ctr --namespace=production images pull docker.io/library/nginx:latest
# Pulls into the 'production' namespace, not default
```

**With authentication:**
```bash
sudo ctr images pull --user username:password docker.io/library/private-image:latest
# For private registries that need login
```

**All platforms at once:**
```bash
sudo ctr images pull --all-platforms docker.io/library/nginx:latest
# Gets amd64, arm64, ppc64le, s390x, arm/v7, etc. ~500MB instead of 150MB
```

**Say this:** "Every pull command shows you exactly what's happening. No background magic. If you want amd64 on an arm64 machine, you get it and you know why you're getting it. That's the containerd philosophy."

#### Commands: List

**Basic listing:**
```bash
sudo ctr images list
# Shows all images with size, digest, unpacked status
# Output:
# REF                                  TYPE                                  DIGEST                                                      SIZE     PLATFORMS     UNPACKED
# docker.io/library/nginx:latest       application/vnd.docker.distribution... sha256:abcd1234...                                        150.3MiB linux/amd64    true
```

**Verbose output (quiet is the default, sort of):**
```bash
sudo ctr images list --quiet
# Just shows the reference, nothing else
```

**Short flag:**
```bash
sudo ctr images list -q
# Same as --quiet, minimal output
```

**From specific namespace:**
```bash
sudo ctr --namespace=production images list
# Lists images only in production namespace
```

**Filter with grep:**
```bash
sudo ctr images list | grep nginx
# Show only nginx images
```

**Say this:** "Listing is your sanity check. Before you create a container, make sure the image is actually pulled. The `UNPACKED` column tells you if the layers have been extracted into snapshots yet."

#### Commands: Tag / Remove

**Tag to registry:**
```bash
sudo ctr images tag docker.io/library/nginx:latest myregistry.local/webserver:v1
# Creates an alias; points to the same image, no copy
```

**Rename tag:**
```bash
sudo ctr images tag nginx:latest nginx:dev
# You can reference the image both ways now
```

**Remove by reference:**
```bash
sudo ctr images remove docker.io/library/nginx:latest
# Removes this reference; if it's the last reference, deletes the image
```

**Short alias for remove:**
```bash
sudo ctr images rm docker.io/library/nginx:latest
# Same as remove, faster to type
```

**Force remove (even if in use):**
```bash
sudo ctr images remove --force docker.io/library/nginx:latest
# Remove even if containers are using it (advanced, dangerous)
```

**Batch remove multiple images:**
```bash
sudo ctr images rm nginx:dev nginx:staging nginx:prod
# Remove three at once
```

**Batch remove with pipe:**
```bash
sudo ctr images list -q | grep nginx | xargs -r sudo ctr images rm
# Nuclear option: remove all nginx images
# `xargs -r` = only run if input is non-empty
```

**Say this:** "Tagging is free—it's just an alias. Removing only deletes the image if no containers reference it. Force remove is the hammer; use only when you know what you're doing."

#### Commands: Export / Import

**Export to tar:**
```bash
sudo ctr images export nginx.tar docker.io/library/nginx:latest
# Creates nginx.tar, portable, can copy anywhere
```

**Export and compress:**
```bash
sudo ctr images export - docker.io/library/nginx:latest | gzip > nginx.tar.gz
# Streams to stdout (that's the `-`), pipe to gzip, save compressed
```

**Export multiple images to one tar:**
```bash
sudo ctr images export multi.tar docker.io/library/nginx:latest docker.io/library/redis:alpine
# Both images in one tar file
```

**Import from tar:**
```bash
sudo ctr images import nginx.tar
# Recreates the image from the tar
```

**Import from compressed tar:**
```bash
gunzip -c nginx.tar.gz | sudo ctr images import -
# Decompress and pipe to import; `-` means stdin
```

**Import into specific namespace:**
```bash
sudo ctr --namespace=production images import nginx.tar
# Import directly into production namespace
```

**Say this:** "Export/import is your air-gapped workflow. Internet down? No problem. You exported the images yesterday. Pop them back in with import. This is essential for disconnected environments."

#### Commands: Labels

**View labels:**
```bash
sudo ctr images label docker.io/library/nginx:latest
# Shows all labels on this image
```

**Set single label:**
```bash
sudo ctr images label docker.io/library/nginx:latest version=1.25
# Adds or overwrites the 'version' label
```

**Set multiple labels:**
```bash
sudo ctr images label nginx:latest maintainer=admin@example.com environment=production
# Multiple labels in one command
```

**Say this:** "Labels are metadata. You can tag images with custom info—version, maintainer, security status, whatever. Later you can filter on these. Useful for inventory and policy enforcement."

#### [LAB] Pull, tag, export, re-import

**Goal:** Pull, tag, export, and re-import a real image using ctr.

1. Pull - get the image into the local content store: `sudo ctr images pull docker.io/library/nginx:alpine`
2. Tag - give the same content an additional, friendlier reference: `sudo ctr images tag docker.io/library/nginx:alpine nginx:lab`
3. Export - serialize the image (all its layers + manifest) into a portable tar file: `sudo ctr images export nginx-lab.tar nginx:lab`
4. Remove originals - delete both references so nothing is left locally: `sudo ctr images rm docker.io/library/nginx:alpine nginx:lab`
5. Re-import - load the image back in from the tar file alone: `sudo ctr images import nginx-lab.tar`
6. **Verify:** images list shows the re-imported image, and it starts a task normally - the tar round-tripped it intact: `sudo ctr images list | grep nginx`

---

## Module: Containers & Tasks

### Lesson: Container Operations (`ctr-containers`)

**Say this:** "Containers are the blueprint. They don't run anything. But they're where you store the metadata: What image? What env vars? What volumes? Think of a container as a signed deployment plan."

#### Commands: Create / List / Info / Labels / Remove

**Create basic container:**
```bash
sudo ctr containers create docker.io/library/nginx:latest my-nginx
# Creates metadata object for 'my-nginx' from the nginx image
# Process: containerd reads image config, creates container metadata
# Result: A container object exists, but no task is running
```

**Create with specific snapshotter:**
```bash
sudo ctr containers create --snapshotter overlayfs docker.io/library/nginx:latest my-nginx
# Explicitly use overlayfs (not native, btrfs, or others)
# Useful if you have multiple snapshotters available
```

**Create in specific namespace:**
```bash
sudo ctr --namespace=production containers create docker.io/library/nginx:latest prod-nginx
# This container lives only in the 'production' namespace
```

**Create with labels:**
```bash
sudo ctr containers create --label app=web --label version=v1 docker.io/library/nginx:latest web-server
# Attach metadata labels for filtering/grouping later
```

**List containers:**
```bash
sudo ctr containers list
# Output:
# ID           IMAGE                             RUNTIME
# my-nginx     docker.io/library/nginx:latest    io.containerd.runc.v2
# web-server   docker.io/library/nginx:latest    io.containerd.runc.v2
# prod-nginx   docker.io/library/nginx:latest    io.containerd.runc.v2
```

**List alias (short):**
```bash
sudo ctr containers ls
# Same as `list`, shorter
```

**Ultra-short alias:**
```bash
sudo ctr c ls
# Even shorter; works the same
```

**List quiet (just IDs):**
```bash
sudo ctr containers list -q
# Output:
# my-nginx
# web-server
# prod-nginx
```

**List from specific namespace:**
```bash
sudo ctr --namespace=k8s.io containers list
# Lists only containers in the k8s.io namespace
# (You won't see your default namespace containers here)
```

**Get container info:**
```bash
sudo ctr containers info my-nginx
# Detailed JSON output: image config, labels, root fs, extensions
```

**List labels on container:**
```bash
sudo ctr containers label my-nginx
# Shows labels attached to this container
```

**Remove container:**
```bash
sudo ctr containers remove my-nginx
# Deletes the container metadata
# (Task must already be stopped and deleted)
```

**Remove alias:**
```bash
sudo ctr containers rm my-nginx
# Same as remove
```

**Another alias:**
```bash
sudo ctr containers delete my-nginx
# All three (remove, rm, delete) do the same thing
```

**Batch remove with pipe:**
```bash
sudo ctr containers list -q | xargs -r sudo ctr containers rm
# Remove all containers; `-r` = only run if there are containers
```

**Say this:** "Creating a container is cheap—it's just metadata. The expensive part is pulling the image. Once a container exists, you can create multiple tasks from it (though you usually don't). Think of it as deploying the same blueprint multiple times."

---

### Lesson: Task Operations (`ctr-tasks`)

**Say this:** "Tasks are the running process. This is where stuff actually *happens*. A task has a PID, CPU, memory, file descriptors. This is what you actually care about for workloads."

#### Commands: ctr run (pull+create+start shortcut)

**Run simple command (one-shot):**
```bash
sudo ctr run --rm docker.io/library/alpine:latest test echo "Hello World"
# 1. Pulls alpine (if needed)
# 2. Creates container called 'test'
# 3. Starts task
# 4. Waits for exit
# 5. Deletes task and container (--rm)
# Output: Hello World
# Process: Image → Container → Task → Process exits → Cleanup
```

**Interactive shell with TTY:**
```bash
sudo ctr run -t --rm docker.io/library/alpine:latest shell /bin/sh
# -t = allocate pseudo-terminal
# -rm = remove on exit
# You now have an interactive shell prompt
# Type `exit` to quit
```

**Detached mode (background):**
```bash
sudo ctr run -d docker.io/library/nginx:latest web-server
# -d = detached
# Process runs in background
# Command returns immediately
# You now have a task with a PID running somewhere
```

**With environment variables:**
```bash
sudo ctr run -d --env MYSQL_ROOT_PASSWORD=secret --env MYSQL_DATABASE=mydb docker.io/library/mysql:8.0 mysql-db
# Multiple --env flags
# Environment variables passed to process
# MySQL sees MYSQL_ROOT_PASSWORD and MYSQL_DATABASE
```

**With resource limits:**
```bash
sudo ctr run -d --memory-limit 536870912 --cpu-quota 50000 docker.io/library/nginx:latest limited-nginx
# --memory-limit in bytes (536870912 = 512MB)
# --cpu-quota in microseconds (50000 = 5% of one CPU roughly)
# Process can't exceed these limits
```

**With host network:**
```bash
sudo ctr run -d --net-host docker.io/library/nginx:latest host-nginx
# --net-host = use host's network namespace
# Container sees the same network interfaces as host
# Useful for network debugging; loses isolation
```

**With mount/volume:**
```bash
sudo ctr run -d --mount type=bind,src=/data,dst=/app/data,options=rbind:rw docker.io/library/nginx:latest data-nginx
# type=bind = bind mount
# src=/data = from host
# dst=/app/data = to container
# options=rbind:rw = recursive bind, read-write
```

**Say this:** "`ctr run` is the all-in-one. Don't like the steps? Use run. It pulls (if needed), creates, starts, and if you add --rm, it cleans up after itself. Perfect for one-shot commands."

#### Commands: Start / List / Metrics / Exec

**Start existing container (foreground):**
```bash
sudo ctr tasks start my-nginx
# Brings up the task for container 'my-nginx'
# Waits for process to exit
# Returns exit code
```

**Start detached:**
```bash
sudo ctr tasks start -d my-nginx
# -d = detached
# Returns immediately, task runs in background
```

**Start with null I/O:**
```bash
sudo ctr tasks start --null-io my-nginx
# Discards stdout/stderr (don't care about logs)
# Useful for fire-and-forget background tasks
```

**List tasks:**
```bash
sudo ctr tasks list
# Output:
# TASK          PID      STATUS
# web-server    34521    RUNNING
# mysql-db      34522    RUNNING
# limited-nginx 34523    RUNNING
```

**List tasks (short alias):**
```bash
sudo ctr tasks ls
# Same as list
```

**Ultra-short alias:**
```bash
sudo ctr t ls
# Even shorter
```

**List tasks in specific namespace:**
```bash
sudo ctr --namespace=k8s.io tasks list
# Lists only tasks in k8s.io namespace
# (K8s pod tasks, not your default namespace stuff)
```

**View task metrics:**
```bash
sudo ctr tasks metrics my-nginx
# Output:
# ID          MEMORY      MEMORY_MAX  CPUS  CPU_SYSTEM  CPU_USER  PID_CURRENT
# my-nginx    15728640    536870912   1.2   125.2       894.3     34521
# (Memory in bytes, CPU in milliseconds, PIDs)
```

**View task processes (ps):**
```bash
sudo ctr tasks ps my-nginx
# Output:
# UID    PID    PPID   C    STIME   TTY   TIME   CMD
# root   34521  1      0    14:23   ?     0:00   nginx: master process...
# (Similar to Linux ps output inside the container)
```

**Exec into task with TTY:**
```bash
sudo ctr tasks exec --exec-id bash-session -t my-nginx /bin/bash
# --exec-id bash-session = unique ID for this exec session
# -t = allocate TTY
# /bin/bash = command to run
# You now have an interactive shell *inside* the running container
# Type `exit` to close the exec session
```

**Exec command and get output:**
```bash
sudo ctr tasks exec --exec-id check my-nginx ls -la /
# Runs `ls -la /` inside the my-nginx container
# Shows the output, returns exit code
```

**Exec with environment variable:**
```bash
sudo ctr tasks exec --exec-id env-test --env VAR1=value1 my-nginx env
# Sets VAR1=value1 in the exec environment
# Runs `env` command inside container
# env sees VAR1 in its output
```

**Exec as different user:**
```bash
sudo ctr tasks exec --exec-id user-test --user 1000:1000 my-nginx whoami
# --user 1000:1000 = UID:GID
# Runs as user 1000 instead of root
# whoami returns 1000 (or username if resolves)
```

**Say this:** "Tasks are the beating heart. Metrics show you resource usage in real-time. Exec lets you debug inside a running container without SSH or separate tools. Very powerful."

#### Commands: Pause / Resume / Kill / Delete

**Pause task (suspend):**
```bash
sudo ctr tasks pause my-nginx
# SIGSTOP to the process
# Process is frozen; kernel bookkeeping continues
# Useful for checkpointing before you migrate
```

**Resume task (unsuspend):**
```bash
sudo ctr tasks resume my-nginx
# SIGCONT to the process
# Process wakes up and continues from where it was frozen
```

**Kill with default signal (SIGTERM):**
```bash
sudo ctr tasks kill my-nginx
# SIGTERM sent
# Process has grace period to shut down
# After ~10s, kernel kills it anyway
# Note: "signal SIGTERM" in output
```

**Kill with SIGKILL (nuclear):**
```bash
sudo ctr tasks kill --signal SIGKILL my-nginx
# SIGKILL sent immediately
# No chance to clean up
# Process is dead, now
# Use only if SIGTERM doesn't work
```

**Kill with SIGHUP (reload config):**
```bash
sudo ctr tasks kill --signal SIGHUP my-nginx
# SIGHUP sent
# Nginx interprets this as "reload config"
# Useful for graceful reload without stopping
```

**Kill all tasks in namespace:**
```bash
sudo ctr --namespace=testing tasks list -q | xargs -r sudo ctr tasks kill
# Lists all task IDs in testing namespace
# Pipes to xargs to kill each one
# Leaves containers intact
```

**Delete task (metadata):**
```bash
sudo ctr tasks delete my-nginx
# Removes task object
# Container still exists
# (Usually do this after task exits)
```

**Force delete:**
```bash
sudo ctr tasks delete --force my-nginx
# Force delete even if task is running
# Kills and removes in one go
```

**Say this:** "Pause/resume is your checkpoint/restore friend. Kill is how you stop things. Delete cleans up the task metadata. Remember: task deleted ≠ container deleted. They're separate."

#### Steps: Full 3-Step Workflow

**Now flagged as a hands-on lab in the app** - goal: "Run the full pull → create → start → verify → cleanup lifecycle for a real container using only ctr."

**Say this:** "This is the full lifecycle. Every real container operation follows this pattern. Watch how it flows."

**Step 1: Pull**
- **Detail:** Get layers into content store
- **Command:** `sudo ctr images pull docker.io/library/nginx:alpine`
- **What happens:** containerd connects to Docker Hub, downloads layers, stores in its content store, verifies checksums

**Step 2: Create**
- **Detail:** Metadata only
- **Command:** `sudo ctr containers create docker.io/library/nginx:alpine web-app`
- **What happens:** containerd creates container metadata object, snapshots the image layers for read-only base, allocates container ID

**Step 3: Start task**
- **Detail:** Process launches
- **Command:** `sudo ctr tasks start -d web-app`
- **What happens:** containerd invokes runc (or other runtime), which spawns the actual process with PID, namespaces, cgroups

**Step 4: Verify**
- **Detail:** See PID/status
- **Command:** `sudo ctr tasks list | grep web-app`
- **What happens:** Query containerd for task info, see PID, status, etc.
- **Output:** `web-app    12345    RUNNING`

**Step 5: Metrics**
- **Detail:** Resource usage
- **Command:** `sudo ctr tasks metrics web-app`
- **What happens:** containerd reads cgroups, returns memory, CPU, I/O stats
- **Output:** Memory 15MB, CPU 0.05%, etc.

**Step 6: Exec**
- **Detail:** In-task command
- **Command:** `sudo ctr tasks exec --exec-id test -t web-app /bin/sh -c "nginx -v"`
- **What happens:** containerd joins task namespaces, runs command, captures output
- **Output:** `nginx version: nginx/1.25.5`

**Step 7: Kill**
- **Detail:** Stop process
- **Command:** `sudo ctr tasks kill web-app`
- **What happens:** containerd sends SIGTERM to process, waits for graceful shutdown
- **Output:** Task exits, task object still exists

**Step 8: Delete task**
- **Detail:** Remove task object
- **Command:** `sudo ctr tasks delete web-app`
- **What happens:** containerd removes task metadata
- **Result:** task no longer appears in `tasks list`, but container still exists

**Step 9: Remove container**
- **Detail:** Remove metadata
- **Command:** `sudo ctr containers remove web-app`
- **What happens:** containerd removes container metadata, snapshots
- **Result:** Complete cleanup, as if it never happened

**Say this:** "Nine steps from idea to gone. But you can do it in seconds. This is the full lifecycle every time you want to run something in containerd. Master this, and you master containerd."

---

### Lesson: Namespaces + Practical Scripts (`ctr-ns-examples`)

**Say this:** "Namespaces are containerd's superpower for multi-tenancy. Imagine completely separate universes inside one daemon. That's namespaces."

#### Code: Multi-namespace Setup

```bash
# Create three separate namespaces
sudo ctr namespaces create development
sudo ctr namespaces create staging
sudo ctr namespaces create production

# Development environment: latest nginx
sudo ctr --namespace=development images pull docker.io/library/nginx:alpine
sudo ctr --namespace=development run -d docker.io/library/nginx:alpine dev-web

# Staging environment: pinned version
sudo ctr --namespace=staging images pull docker.io/library/nginx:1.25
sudo ctr --namespace=staging run -d docker.io/library/nginx:1.25 staging-web

# Production environment: older stable version
sudo ctr --namespace=production images pull docker.io/library/nginx:1.24
sudo ctr --namespace=production run -d docker.io/library/nginx:1.24 prod-web

# Check what's running in each
sudo ctr --namespace=development tasks list
sudo ctr --namespace=staging tasks list
sudo ctr --namespace=production tasks list
```

**Say this:** "Three completely isolated namespaces. Each has its own images, containers, tasks. Production can run ancient nginx 1.24 while dev runs bleeding-edge alpine. They never interfere. This is how Kubernetes multi-tenancy works—each customer gets a namespace."

#### Code: Backup Images Script Sketch

```bash
# Backup all images to timestamped directory
BACKUP_DIR="/backup/containerd/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Export each image as tar
sudo ctr images list -q | while read image; do
  filename=$(echo "$image" | tr '/:' '-')
  sudo ctr images export "$BACKUP_DIR/${filename}.tar" "$image"
done

# Save namespace list for reference
sudo ctr namespaces list > "$BACKUP_DIR/namespaces.txt"
```

**Say this:** "This script backs up every image in containerd as separate tar files, timestamped by date. If disaster strikes, you can `import` them back. Essential for air-gapped environments and disaster recovery."

#### Commands: Checkpoint / Restore (CRIU)

**Install CRIU (Checkpoint/Restore In Userspace):**
```bash
sudo apt install criu
# CRIU is a separate tool; you need it for checkpoint/restore
```

**Run a container:**
```bash
sudo ctr run -d docker.io/library/nginx:latest web
# Start nginx in background
# It's now running, handling requests (hypothetically)
```

**Create checkpoint:**
```bash
sudo ctr tasks checkpoint --image-path /tmp/checkpoint web
# CRIU snapshots the entire process state
# Memory, file descriptors, open connections, all saved to /tmp/checkpoint
# The task continues running after the checkpoint
```

**Restore from checkpoint:**
```bash
sudo ctr tasks restore --image-path /tmp/checkpoint web
# CRIU restores the process from checkpoint
# Process wakes up as if nothing happened
# Useful for: live migration, faster startup, disaster recovery
```

**Say this:** "Checkpoint is like hitting pause on a process, saving its brain to disk, then resuming. Restore wakes it up. Sounds like magic, right? It's CRIU. Used by Kubernetes for live migration, by serverless platforms for warm starts, by container orchestrators for disaster recovery."

#### Commands: Custom Network Namespace

**Create custom netns:**
```bash
sudo ip netns add my-netns
# Creates a custom network namespace with its own network stack
# Completely isolated network interfaces
```

**Run container in custom netns:**
```bash
sudo ctr run -d --net-ns /var/run/netns/my-netns docker.io/library/nginx:latest custom-net-nginx
# --net-ns /var/run/netns/my-netns = use this network namespace
# Container now sees only interfaces in my-netns
# Not the default network
# Useful for network isolation, testing, multi-NIC setups
```

**Say this:** "Container networking isn't magic—it's Linux namespaces. By default, each container gets its own netns. But you can pin multiple containers to the same netns, or use a custom one. Full control."

---

# PART 4 · FEATURES & FUTURE

## Module: Key Features

### Lesson: Encryption, Lazy Pull, CNI, CRIU, Metrics (`feat-advanced`)

**Say this:** "containerd has some features that Docker wishes it had. Let's go through them."

#### Commands: Image Encryption (nerdctl)

**Encrypt an image:**
```bash
nerdctl image encrypt --recipient=jwe:pubkey.pem myapp:latest myapp:encrypted
# Uses public key cryptography (JWE format)
# myapp:latest → myapp:encrypted (encrypted variant)
# Image is now unreadable without private key
```

**Push encrypted image:**
```bash
nerdctl push myapp:encrypted
# Pushes the encrypted version to registry
# Registry has no idea what's inside
# Perfect for security-conscious teams
```

**Pull encrypted image:**
```bash
nerdctl pull myapp:encrypted
# Downloads the encrypted image
# Can't be used without decryption
```

**Run with decryption:**
```bash
nerdctl run --decrypt=privkey.pem myapp:encrypted
# Uses private key to decrypt layers on-the-fly
# containerd decrypts, uncompresses, and runs
# Private key never leaves your machine
```

**Say this:** "Image encryption is paranoia in the best way. Your proprietary code is encrypted in the registry. Even if someone breaches your registry, they can't see your layers. This is how financial institutions handle container images."

#### Commands: Lazy Pulling (stargz)

**Run with stargz snapshotter:**
```bash
nerdctl run --snapshotter=stargz nginx:latest
# Starts immediately; layers pull on demand
# ~80% faster cold start in ideal cases
# Note: Useful for large images, serverless cold starts, edge deployments
```

**Say this:** "Stargz is a game-changer for latency-sensitive workloads. Instead of waiting 30 seconds for a gigabyte image to pull, you start in 1 second and pull layers as you use them. This is why serverless platforms love containerd."

#### Code: CNI Example Configuration

```json
{
  "cniVersion": "0.4.0",
  "name": "mynet",
  "type": "bridge",
  "bridge": "cni0",
  "isGateway": true,
  "ipMasq": true,
  "ipam": {
    "type": "host-local",
    "subnet": "10.88.0.0/16"
  }
}
```

**Say this:** "This is a CNI (Container Network Interface) config. Tells containerd how to set up networking: create a bridge called cni0, assign IP 10.88.0.0/16 subnet, masquerade outgoing traffic. Put this in /etc/cni/net.d/10-mynet.conf and containerd uses it for every container."

#### List: CNI Plugins You Will Meet

- **bridge** — Simple bridge, like Docker's default network
- **ipvlan/macvlan** — Advanced: multiple MAC addresses on one interface, IP per container
- **flannel** — K8s overlay network, VXLAN tunnels between nodes
- **Calico** — BGP-based networking, security policies, high performance
- **Cilium (eBPF)** — Kernel eBPF for network policy and load balancing, next-generation
- **Weave** — Encrypted overlay network, simple setup

**Say this:** "Bridge is easy. Flannel is standard on K8s clusters. Calico is for large-scale K8s. Cilium is the future—using kernel eBPF to do networking at wire speed. All of them plug into containerd via CNI."

#### Commands: Checkpoint/Restore (nerdctl)

**Create checkpoint:**
```bash
nerdctl checkpoint create mycontainer checkpoint1
# Saves state of running container to named checkpoint
# Container keeps running
```

**Restart from checkpoint:**
```bash
nerdctl start --checkpoint=checkpoint1 mycontainer
# Restores container from checkpoint1
# Resumes execution from where it was frozen
```

**Say this:** "Checkpoints are your secret weapon for disaster recovery and live migration. A database running for days? Checkpoint it. Switch hardware. Restore it on new hardware. Zero downtime."

#### List: CRIU Use Cases

- **Live migration** — Move running container from one host to another without stopping it
- **Debug freeze/thaw** — Freeze a process, examine memory/state, then thaw it
- **Disaster recovery drills** — Checkpoint critical services, practice restoring them
- **Faster warm starts** — Serverless: checkpoint empty VM state, restore to speed up cold starts

**Say this:** "CRIU + checkpoint/restore is advanced. Most people don't use it. But when you need zero-downtime migrations or sub-second function startup in serverless, it's invaluable. It's the tool that makes impossible things possible."

#### [LAB] Normal pull vs lazy pull cold start

**Goal:** Compare cold-start time of a normal pull vs a lazy pull (stargz) snapshotter.

1. Time a normal cold start - pull happens fully before the container can run, time the whole thing: `time nerdctl run --rm docker.io/library/nginx:latest nginx -v`
2. Time a lazy-pull cold start - with the stargz snapshotter, layers stream in on demand instead of all up front: `time nerdctl run --rm --snapshotter=stargz ghcr.io/stargz-containers/nginx:latest-esgz nginx -v`
3. Notice the gap - the stargz run becomes responsive noticeably faster, even though total layer transfer isn't complete yet - only the bytes needed to start are fetched first.
4. **Verify:** compare the two `time` outputs - the stargz run's wall-clock time to a usable process is meaningfully lower, confirming lazy pull is working: `nerdctl ps`

---

## Module: Real-World Use Cases

### Lesson: Where containerd Shines (`use-all`)

**Say this:** "containerd isn't just 'Docker without the UI.' It's optimized for specific scenarios where it outshines Docker."

#### Use Case Cards

**Card 1: Large-scale Kubernetes** (MCB Blue)
- **Tag:** K8s
- Default on EKS/GKE/AKS. Direct CRI, low overhead, millions of nodes.
- **Say this:** "75% of Kubernetes clusters now use containerd. AWS, Google, Microsoft—they all chose it. Because at scale, every MB of memory and millisecond of CPU matters. Docker can't compete at that scale."

**Card 2: Edge / IoT** (Green)
- **Tag:** Edge
- Small binary (~30MB), low idle RAM, ARM-friendly.
- **Say this:** "Your Raspberry Pi has 512MB RAM. Docker takes 150MB just sitting there. containerd takes 30MB. That's 120MB available for your actual workload. Edge deployments live on this."

**Card 3: CI/CD runners** (Blue)
- **Tag:** CI
- Fast pull + start; clean namespaces per job; easy wipe of content store.
- **Say this:** "GitHub Actions, GitLab CI, Jenkins—they spin up thousands of container jobs per day. Each job needs a fresh, clean environment. containerd's namespace isolation makes this perfect. And the startup time is critical when you're billing per-second."

**Card 4: Multi-tenant platforms** (Orange)
- **Tag:** SaaS
- ctr namespaces per customer/team; resource isolation for accounting.
- **Say this:** "SaaS platform with 1000 customers. Each customer gets their own namespace. Their images, containers, tasks—completely isolated. Easy to track resource usage per customer. Easy to prevent namespace pollution."

**Card 5: Serverless** (Yellow)
- **Tag:** FaaS
- Firecracker/microVM runtimes; CRIU warm starts; stargz lazy images.
- **Say this:** "AWS Lambda, Google Cloud Functions—they're built on containerd with custom runtimes. Pull 80% faster with stargz. Start from checkpoint 100x faster with CRIU. That's how they do sub-second cold starts."

#### Table: Why It Matters (Efficiency)

| Metric | Docker Engine | ContainerD |
|--------|---------------|-----------|
| Memory idle | 150 MB | 30 MB |
| Memory / container | +5 MB | +1 MB |
| Startup | 2–3s | <1s |
| Launch | 800ms | 500ms |
| CPU idle | 1–2% | <0.5% |

**Say this:** "These aren't marketing numbers. These are real benchmarks from production. Docker idles at 150MB; containerd idles at 30MB. Times five hundred containers running on a node, that's 600MB saved just by not running Docker. In the serverless world, this difference means profit margin."

#### Diagram: K8s Market Share (Approx.)

```
ContainerD  ████████████████████████████  75%
CRI-O       ███████                      20%
Others      ██                            5%
```

**Say this:** "Three-quarters of Kubernetes clusters run containerd. The remaining 25% is mostly CRI-O (RedHat's open-source runtime) and a few diehards still on Docker. The industry has spoken."

---

## Module: Future & Bridge to Kubernetes

### Lesson: Trends & Emerging Tech (`future-trends`)

**Say this:** "We've covered the present. Now let's glimpse the future. Where is containerd headed?"

#### List: Current Trends

- **Rootless containers by default more often** — No root needed to run containers; better security
- **WASM workloads beside Linux containers** — Write Rust/Go, compile to WASM, run in containerd alongside containers
- **Stronger sandboxing (gVisor/Kata/confidential)** — Containers aren't isolated enough? Stack gVisor (userspace kernel) or Kata (lightweight VMs) on top
- **Faster startup + lower overhead** — Every second counts in serverless; every MB counts in edge
- **Better Windows parity** — Windows containers work, but not as well as Linux; next focus

**Say this:** "Five trends shaping the next year. Rootless is security best practice. WASM is the new frontier—write once, run on any platform. Sandboxing adds defense-in-depth. Speed and resource efficiency are always targets. Windows support democratizes containers."

#### List: Emerging

- **Lazy pull evolution: HTTP/3, P2P layers, CDN** — Current lazy pull uses HTTP/2. Next: HTTP/3 (faster), P2P (peer-to-peer layer distribution), CDN-friendly caching
- **eBPF security policies + hardware isolation** — Kernel eBPF for network and syscall policies; hardware-backed isolation (Intel TDX, AMD SEV)
- **CSI / distributed storage backends** — Persistent storage in containers; support for Ceph, EBS, cloud storage natively
- **Edge offline modes + ARM64 optimization** — Build once, run anywhere (including Raspberry Pi); optimize for offline scenarios
- **Confidential computing / TEE integration** — Trusted Execution Environments (Intel SGX, AMD SEV-SNP); encrypt data even in running process
- **AI/ML GPU container workloads** — NVIDIA integration; running LLMs in containers; GPU scheduling in K8s

**Say this:** "These are the bleeding edge. eBPF is transforming Linux security. Confidential computing is paranoia for regulated industries. GPU containers are the hot trend right now—everyone wants to run LLMs. These will define the next decade."

#### Code: Go Client Sketch (gRPC API)

```go
// Connect to containerd daemon
client, _ := containerd.New("/run/containerd/containerd.sock")
defer client.Close()

// Use the 'default' namespace
ctx := namespaces.WithNamespace(context.Background(), "default")

// Pull an image
image, _ := client.Pull(ctx, "docker.io/library/nginx:latest")

// Create a container with a snapshot from the image
container, _ := client.NewContainer(ctx, "nginx-1",
  containerd.WithNewSnapshot("nginx-1-snapshot", image),
  containerd.WithNewSpec(),
)

// Create and start a task
task, _ := container.NewTask(ctx, cio.NewCreator())
task.Start(ctx)
```

**Say this:** "This is how you talk to containerd from Go. gRPC API, direct connection to the socket. No HTTP REST layer. Raw speed. This is what kubectl does under the hood. This is what Kubernetes operators do. Learn this pattern, and you can build anything on containerd."

#### Callout: Key Takeaways

> **Key takeaways:** containerd is the engine under Docker and most Kubernetes clusters. Efficient, graduated CNCF project, multi-runtime, production battle-tested. Next chapter of this adventure: Kubernetes orchestration on top of this engine.

**Say this:** "You now know what 90% of DevOps engineers don't know. You understand the engine. Docker is the dashboard. Kubernetes is the orchestrator. But the actual container runtime—the machinery that makes it all work—that's containerd. And you've learned it inside and out."

#### List: Part 3 Video Topics (K8s/CRI - Next in Your Series)

- **CRI plugin architecture** — How containerd implements Kubernetes Container Runtime Interface
- **kubelet ↔ containerd gRPC flow** — Kubernetes master asks kubelet, kubelet asks containerd
- **Pod sandbox (pause container)** — The invisible container that makes pods work
- **Kubernetes 1.24 dockershim removal details** — Why Docker support was removed from K8s
- **containerd on EKS / GKE / AKS** — How major clouds run Kubernetes on containerd

**Say this:** "Next, we dive into Kubernetes. How does it use containerd? How does kubelet talk to the runtime? What's a pause container? Why did Kubernetes drop Docker? Those are the next chapters. You're ready for them now."

---

---

# QUICK REFERENCE CHEAT SHEET

```
╔════════════════════════════════════════════════════════════════════════════╗
║                   CONTAINERD ctr CLI CHEAT SHEET                           ║
║                   Everything You Need to Remember                          ║
╚════════════════════════════════════════════════════════════════════════════╝

[SERVICE]
  sudo ctr version
  sudo ctr info

[IMAGES]
  sudo ctr images pull docker.io/library/nginx:latest
  sudo ctr images pull --platform linux/arm64 docker.io/library/alpine:latest
  sudo ctr images list
  sudo ctr images list -q
  sudo ctr images tag nginx:latest nginx:v1.0
  sudo ctr images remove nginx:v1.0
  sudo ctr images export backup.tar docker.io/library/nginx:latest
  sudo ctr images import backup.tar
  sudo ctr images label docker.io/library/nginx:latest version=1.25

[CONTAINERS]
  sudo ctr containers create docker.io/library/nginx:latest my-nginx
  sudo ctr containers list
  sudo ctr containers info my-nginx
  sudo ctr containers label my-nginx app=web
  sudo ctr containers remove my-nginx
  sudo ctr containers delete my-nginx

[TASKS]
  sudo ctr run -d docker.io/library/nginx:latest web-server
  sudo ctr run -t --rm docker.io/library/alpine:latest shell /bin/sh
  sudo ctr tasks start my-nginx
  sudo ctr tasks start -d my-nginx
  sudo ctr tasks list
  sudo ctr tasks metrics my-nginx
  sudo ctr tasks ps my-nginx
  sudo ctr tasks exec --exec-id bash -t my-nginx /bin/bash
  sudo ctr tasks pause my-nginx
  sudo ctr tasks resume my-nginx
  sudo ctr tasks kill my-nginx
  sudo ctr tasks kill --signal SIGKILL my-nginx
  sudo ctr tasks delete my-nginx

[NAMESPACES]
  sudo ctr namespaces create production
  sudo ctr namespaces list
  sudo ctr --namespace=production images list
  sudo ctr --namespace=production containers create ... app1
  sudo ctr --namespace=production tasks list

[DEBUG]
  sudo ctr --debug images pull ...
  sudo ctr --address /run/containerd/containerd.sock version
  sudo ctr --connect-timeout 30s version
  ctr --help
  ctr images --help

[SNAPSHOTS]
  sudo ctr snapshots list
  sudo ctr snapshots info snapshot-id
  sudo ctr snapshots rm snapshot-id
  sudo ctr snapshots usage snapshot-id

[CONTENT]
  sudo ctr content ls
  sudo ctr content delete digest-hash

[GOLDEN RULES]
  • Always use full image refs: docker.io/library/nginx:latest (not just nginx)
  • Container ≠ Task: Create container, then start task
  • Namespaces are mandatory: Default namespace, k8s.io, moby, or custom
  • Task operations: start → exec/metrics → kill → delete
  • Container cleanup: Delete task first, then remove container
  • Batch operations: Use `list -q | grep X | xargs sudo ctr <cmd> rm`

╚════════════════════════════════════════════════════════════════════════════╝
```

---

# DEMO CHECKPOINT MAP

Everything you need to demo each slide. Track what gets demoed, where, and how.

| Slide ID | Demo on Slide | What to Demo |
|----------|---------------|-------------|
| `ctr-what` | None | Slides only—no demo yet |
| `ctr-concepts` | DemoContainerVsTask | Pull nginx → Create container (no task) → List containers → List tasks (empty) → Start task → List tasks (with PID) |
| `ctr-images-all` | None | Show: Pull (docker.io refs), List (quiet), Tag, Remove, Export tar, Import tar, Label commands live |
| `ctr-containers` | None | Show: Create, List, Info output, Label, Remove workflow—at least 3 containers |
| `ctr-tasks` | None | Show: `ctr run` one-shot → `ctr run -t` interactive shell → `ctr run -d` background → `ctr tasks metrics` → `ctr tasks exec` → Kill → Delete |
| `ctr-tasks` (steps) | None | Walk through all 9 steps: Pull → Create → Start → Verify → Metrics → Exec → Kill → Delete task → Remove container—each with live output |
| `ctr-ns-examples` | None | Create 3 namespaces (dev/staging/prod) → Pull to each → Run containers → List from each namespace—show isolation |
| `feat-advanced` | None | Show: stargz pull faster, CNI config file, CRIU checkpoint/restore if available (optional) |
| `use-all` | None | Slides + Table—don't need live demo |
| `future-trends` | None | Slides + Code snippet—Go client code is example only |

---

# FINAL WORDS

> You now know more about container internals than 90% of people who use Docker daily. You understand images, containers, tasks, snapshots, namespaces. You can manipulate them with ctr—the diagnostic tool that most DevOps engineers have never touched. You've learned the engine.
>
> Docker is the dashboard. Kubernetes is the orchestrator. But containerd—the engine—that's what you've mastered. Everything else is just UI on top of this.
>
> Next chapter: Kubernetes. How does it use containerd? How does it orchestrate these containers across a cluster? You're ready. You've earned it.
>
> Go forth. Build things. Break things (in dev). Fix them. Understand what's happening under the hood. That's the engineer's superpower.

---

**END OF PART 3 & 4 COMPREHENSIVE TEACHING NOTES**

Generated with thorough detail, every command, every concept, every analogy included.
