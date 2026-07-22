import type { Module } from '../types';

export const part2Modules: Module[] = [
  {
    id: 'snapshots',
    part: 'Part 2 · Internals',
    title: 'Snapshots & OverlayFS',
    short: 'Snapshots',
    icon: 'Layers',
    lessons: [
      {
        id: 'snap-system',
        title: 'Snapshotter System',
        subtitle: 'From Part 2 video plan - pure containerd internals',
        blocks: [
          {
            type: 'text',
            body: 'containerd does not hard-code one filesystem design. It talks to a snapshotter plugin. The snapshotter owns chains of read-only parent layers and writable active snapshots for containers.',
          },
          {
            type: 'demo',
            demoId: 'VisualSnapshotSystem',
          },
          {
            type: 'diagram',
            title: 'Abstraction',
            lines: [
              'containerd  →  snapshotter plugin  →  filesystem backend',
              '                 (overlayfs | btrfs | zfs | native | devmapper | stargz)',
            ],
          },
          {
            type: 'table',
            title: 'Common snapshotters',
            headers: ['Snapshotter', 'Style', 'Notes'],
            rows: [
              ['overlayfs', 'Union FS', 'Default on Linux; fast; ubiquitous'],
              ['btrfs', 'COW FS', 'Native snapshots on btrfs'],
              ['zfs', 'COW FS', 'Advanced snapshot features'],
              ['devmapper', 'Block', 'Thin provisioning / block level'],
              ['native', 'Directories', 'Windows / simple dir copy'],
              ['stargz', 'Lazy pull', 'Start before full download'],
            ],
          },
          {
            type: 'commands',
            title: 'Snapshot CLI',
            items: [
              { cmd: 'sudo ctr snapshots list' },
              { cmd: 'sudo ctr snapshots --snapshotter overlayfs list' },
              { cmd: 'sudo ctr snapshots info <snapshot-key>' },
              { cmd: 'sudo ctr snapshots prepare my-snapshot parent-snapshot' },
              { cmd: 'sudo ctr snapshots commit new-snapshot my-snapshot' },
              { cmd: 'sudo ctr snapshots remove my-snapshot' },
              { cmd: 'sudo ctr snapshots tree', note: 'view parent/child relationships' },
            ],
          },
          {
            type: 'code',
            title: 'Select snapshotter in config.toml',
            lang: 'toml',
            code: `[plugins."io.containerd.grpc.v1.cri".containerd]
  snapshotter = "overlayfs"  # or btrfs, zfs, stargz, ...`,
          },
        ],
      },
      {
        id: 'overlayfs',
        title: 'OverlayFS Deep Dive',

        blocks: [
          {
            type: 'demo',
            demoId: 'DemoOverlayFS',
          },
          {
            type: 'demo',
            demoId: 'VisualOverlayFS',
          },
          {
            type: 'text',
            body: 'OverlayFS merges directories into one unified view. containerd uses it for copy-on-write: image layers shared read-only; each container gets its own writable upper layer.',
          },
          {
            type: 'cards',
            title: 'Four directories',
            items: [
              { title: 'lowerdir', body: 'One or more read-only layers (image parents), stacked bottom→top', tag: 'RO', color: 'blue' },
              { title: 'upperdir', body: 'Writable layer for THIS container only', tag: 'RW', color: 'green' },
              { title: 'workdir', body: 'Kernel temp dir for atomic copy-up operations', tag: 'TMP', color: 'yellow' },
              { title: 'merged', body: 'Unified view the container process actually sees as /', tag: 'VIEW', color: 'mcb' },
            ],
          },
          {
            type: 'steps',
            title: 'Read vs write',
            steps: [
              { title: 'Read', detail: 'Look upper first; if missing, fall through lower layers. Process sees a full FS.' },
              { title: 'Write existing file', detail: 'Copy-on-write: copy from lower → upper, then modify the copy. Lower never changes.' },
              { title: 'Create new file', detail: 'Appears only in upperdir' },
              { title: 'Delete lower file', detail: 'Whiteout in upper hides lower file from merged view' },
            ],
          },
          {
            type: 'tree',
            title: 'On-disk paths',
            lines: [
              '/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/',
              '├── snapshots/',
              '│   ├── 1/fs   # image layer snapshot',
              '│   ├── 2/fs   # another parent / container upper',
              '│   └── 3/fs',
              '└── metadata.db',
            ],
          },
          {
            type: 'commands',
            title: 'See real mounts',
            items: [
              {
                cmd: 'mount | grep overlay',
                note: 'shows lowerdir=, upperdir=, workdir= for each container',
              },
              { cmd: 'sudo ls /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/' },
            ],
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Why containers are cheap',
            body: 'Image layers shared across all containers. Writes isolated per container. No full filesystem copy on start.',
          },
          {
            type: 'steps',
            kind: 'lab',
            title: 'Lab: inspect the overlay mount of a running container',
            goal: "Inspect the overlay mount backing a running container's writable filesystem.",
            steps: [
              { title: 'Start a task', detail: 'Get a real container running so it has a live overlay mount.', cmd: 'sudo ctr run -d docker.io/library/nginx:latest overlay-lab' },
              { title: 'Find its snapshot key', detail: 'The snapshot key ties the container to its overlay directories.', cmd: 'sudo ctr snapshots list' },
              { title: 'See the real mount line', detail: 'This is the actual lowerdir=/upperdir=/workdir= the kernel is using - not a diagram.', cmd: 'mount | grep overlay' },
              { title: 'Write inside the container', detail: 'Any write from inside the container lands in upperdir on the host, never touching the shared lowerdir layers.', cmd: 'sudo ctr tasks exec --exec-id write-test -t overlay-lab /bin/sh -c "echo hello > /lab-proof.txt"' },
              { title: 'Verify', detail: 'The new file shows up in upperdir on the host - proof that writes are isolated per container and lowerdir stays read-only.', cmd: 'sudo find /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/ -name lab-proof.txt' },
            ],
          },
        ],
      },
      {
        id: 'content-cas',
        title: 'Content-Addressable Storage',
        blocks: [
          {
            type: 'list',
            title: 'Benefits',
            items: [
              'Integrity: detect corruption/tampering via sha256',
              'Deduplication: shared layers stored once',
              'Efficient transfer: only missing layers downloaded',
              'Reproducibility: same content = same hash',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'How content-addressable storage actually works',
            body: 'Every blob - layer, manifest, or config - is stored and retrieved by the SHA256 hash of its own bytes, not by a human-assigned name. It is a content library with SHA256 addresses instead of Dewey Decimal numbers. Identical content anywhere (any image, any tag) always resolves to the same on-disk blob, which is why dedup and integrity checking fall out for free instead of needing to be built separately.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'BoltDB: the metadata source of truth',
            body: 'All daemon-level metadata - images, containers, tasks, namespaces, snapshot leases - lives in a single embedded BoltDB key-value database file, typically /var/lib/containerd/io.containerd.metadata.v1.bolt/meta.db. That is what containerd consults to know what exists. The content-addressable blob store above is a separate thing - it holds the actual bytes, not the bookkeeping.',
          },
          {
            type: 'commands',
            items: [
              { cmd: 'nerdctl pull ubuntu:20.04' },
              { cmd: 'nerdctl pull ubuntu:22.04', note: 'shared base layers only stored once' },
              { cmd: 'sudo du -sh /var/lib/containerd/' },
              { cmd: 'sudo ctr content list' },
              { cmd: 'sudo ctr content info sha256:abc123...' },
              { cmd: 'sudo ctr content label sha256:abc123... mylabel=value' },
              { cmd: 'sudo ctr content delete sha256:abc123...', note: 'dangerous - can break images' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'oci-runtimes',
    part: 'Part 2 · Internals',
    title: 'OCI Spec & Runtimes',
    short: 'OCI',
    icon: 'Box',
    lessons: [
      {
        id: 'oci-spec',
        title: 'OCI Runtime Spec',
        blocks: [
          {
            type: 'text',
            body: 'OCI defines Runtime Spec, Image Spec, and Distribution Spec. containerd generates an OCI config.json; the low-level runtime consumes it.',
          },
          {
            type: 'list',
            title: 'config.json typically covers',
            items: [
              'process args/env/cwd/user',
              'linux.namespaces (pid, network, mount, uts, ipc, user)',
              'mounts (rootfs, proc, sys, binds)',
              'linux.capabilities (bounding/effective/permitted)',
              'linux.seccomp profile',
              'linux.resources (cgroup limits)',
            ],
          },
          {
            type: 'commands',
            title: 'runc flow (educational)',
            items: [
              { cmd: 'runc spec', note: 'generate default config.json in bundle dir' },
              { cmd: 'runc create myctr', note: 'create container without starting' },
              { cmd: 'runc start myctr' },
              { cmd: 'runc state myctr' },
              { cmd: 'runc delete myctr' },
            ],
          },
          {
            type: 'diagram',
            title: 'containerd path',
            lines: [
              'containerd → forks shim → shim execs runc create/start',
              'runc sets up namespaces/cgroups/rootfs → execs init → runc exits',
              'shim stays, holds stdio + exit code + PID file',
            ],
          },
          {
            type: 'steps',
            kind: 'lab',
            title: 'Lab: generate a config.json and compare it to containerd\'s',
            goal: "Generate a default OCI config.json and find where containerd's generated version differs.",
            steps: [
              { title: 'Generate a default spec', detail: 'runc alone, no containerd involved - this is the raw OCI runtime spec baseline.', cmd: 'mkdir -p /tmp/lab-bundle && cd /tmp/lab-bundle && runc spec' },
              { title: 'Inspect the baseline', detail: 'Look at process.args, linux.namespaces, and linux.capabilities - this is the minimum OCI spec.', cmd: 'cat /tmp/lab-bundle/config.json' },
              { title: 'Start a real containerd task', detail: 'containerd generates its own config.json per task, richer than the runc default.', cmd: 'sudo ctr run -d docker.io/library/nginx:latest spec-lab' },
              { title: "Find containerd's generated bundle", detail: 'Every running task has a bundle dir with its own config.json under the runtime state path.', cmd: 'sudo find /run/containerd/io.containerd.runtime.v2.task/ -name config.json' },
              { title: 'Verify', detail: "Both files are valid OCI runtime spec JSON with process/root/linux.namespaces sections, but containerd's version has mounts, cgroup paths, and a rootfs pointing at the real overlay snapshot - the runc default is just a skeleton.", cmd: 'cat /run/containerd/io.containerd.runtime.v2.task/default/spec-lab/config.json' },
            ],
          },
        ],
      },
      {
        id: 'alt-runtimes',
        title: 'Alternative Runtimes',
        blocks: [
          {
            type: 'table',
            headers: ['Runtime', 'Isolation', 'Performance', 'Startup', 'Use case'],
            rows: [
              ['runc', 'Namespaces', 'Fastest', '<50ms', 'General purpose'],
              ['gVisor (runsc)', 'User-space kernel / syscall intercept', 'Good', '~200ms', 'Untrusted workloads'],
              ['Kata', 'Lightweight VM', 'Good', '~500ms', 'Strong isolation'],
              ['Firecracker', 'MicroVM', 'Good', '~125ms', 'Serverless'],
            ],
          },
          {
            type: 'commands',
            title: 'Run with specific runtime',
            items: [
              { cmd: 'nerdctl run --runtime=runc nginx' },
              { cmd: 'nerdctl run --runtime=runsc nginx', note: 'gVisor' },
              { cmd: 'nerdctl run --runtime=kata nginx' },
              { cmd: 'nerdctl run --runtime=firecracker nginx' },
              { cmd: 'sudo ctr plugins list | grep runtime' },
              {
                cmd: 'sudo ctr run --runtime io.containerd.runsc.v1 docker.io/library/alpine:latest secure-container echo "gVisor"',
              },
              {
                cmd: 'sudo ctr run --runtime io.containerd.kata.v2 docker.io/library/nginx:latest kata-web',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'security',
    part: 'Part 2 · Internals',
    title: 'Security',
    short: 'Security',
    icon: 'Shield',
    lessons: [
      {
        id: 'sec-stack',
        title: 'Capabilities, seccomp, MAC, Rootless',
        blocks: [
          {
            type: 'cards',
            items: [
              {
                title: 'Linux capabilities',
                body: 'containerd/runc drop dangerous caps by default (e.g. CAP_NET_RAW often restricted). Least privilege at process level.',
                tag: 'caps',
                color: 'yellow',
              },
              {
                title: 'seccomp',
                body: 'Syscall allow-list loaded via OCI spec. Blocks dangerous syscalls even if process is root in container.',
                tag: 'syscalls',
                color: 'red',
              },
              {
                title: 'AppArmor / SELinux',
                body: 'Mandatory access control profiles applied at task start - confines file/network operations.',
                tag: 'MAC',
                color: 'orange',
              },
              {
                title: 'Rootless',
                body: 'UID 0 inside maps to unprivileged host UID via user namespaces - reduce host blast radius.',
                tag: 'rootless',
                color: 'green',
              },
            ],
          },
          {
            type: 'demo',
            demoId: 'VisualSecurityLayers',
          },
          {
            type: 'list',
            title: 'Security wins of the architecture',
            items: [
              'Smaller attack surface than full Docker Engine path',
              'Plugin isolation boundaries',
              'Multi-runtime: escalate isolation (gVisor/Kata) per workload',
              'Image encryption for registry-at-rest confidentiality',
            ],
          },
          {
            type: 'callout',
            variant: 'warn',
            title: 'Mental model',
            body: 'Isolation is layered: user ns + mount ns + net ns + cgroups + caps + seccomp + MAC (+ optional VM sandbox). containerd wires these via OCI; kernel enforces them.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'What are cgroups?',
            body: 'cgroups (control groups) are a Linux kernel mechanism that groups processes together and limits, accounts for, and isolates their collective use of a resource - CPU, memory, disk I/O, network. A container\'s "--memory" and "--cpu" limits are just cgroup settings applied to the task\'s process group; the kernel enforces the ceiling, containerd only configures it via the OCI spec.',
          },
          {
            type: 'steps',
            kind: 'lab',
            title: 'Lab: verify seccomp/capability restrictions are actually enforced',
            goal: 'Verify the seccomp and capability restrictions actually applied to a running task, not just documented.',
            steps: [
              { title: 'Start a task normally', detail: 'Default security profile - no special flags.', cmd: 'sudo ctr run -d docker.io/library/alpine:latest sec-lab' },
              { title: 'Try a gated operation', detail: 'Setting the system clock needs CAP_SYS_TIME and is also blocked by the default seccomp profile - expect it to fail even though the process is root inside the container.', cmd: 'sudo ctr tasks exec --exec-id sec-test -t sec-lab date -s "2020-01-01"' },
              { title: 'Confirm root inside is not root outside', detail: 'The process shows uid 0 inside the container, but the operation above still failed - proof root-in-container is not root-on-host.', cmd: 'sudo ctr tasks exec --exec-id whoami-test sec-lab whoami' },
              { title: 'Verify', detail: 'The gated operation returned a permission/operation-not-permitted error - the security layers are actively enforced by the kernel, not just described in a slide.', cmd: 'sudo ctr tasks exec --exec-id sec-test2 -t sec-lab date -s "2020-01-01"; echo "exit code: $?"' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'debugging',
    part: 'Part 2 · Internals',
    title: 'Debugging Toolkit',
    short: 'Debug',
    icon: 'Terminal',
    lessons: [
      {
        id: 'debug-seven',
        title: 'Seven Steps (no Docker required)',
        subtitle: 'From Part 2 debugging script - covers ~90% of incidents',

        blocks: [
          {
            type: 'demo',
            demoId: 'DemoDebugFlow',
          },
          {
            type: 'steps',
            steps: [
              {
                title: '1. Get task PID',
                detail: 'Host PID of the container init - every later step uses it',
                cmd: 'sudo ctr tasks list',
              },
              {
                title: '2. Inspect namespaces',
                detail: 'Same inode number under /proc/*/ns = same namespace',
                cmd: 'ls -la /proc/<PID>/ns/',
              },
              {
                title: '3. nsenter into namespaces',
                detail: 'See network/pid/mount/uts exactly as the container sees them',
                cmd: 'sudo nsenter -t <PID> --net --pid --mount --uts /bin/sh',
              },
              {
                title: '4. ctr tasks exec',
                detail: 'Same namespaces + cgroups + security profile as the task',
                cmd: 'sudo ctr tasks exec --exec-id debug -t my-container /bin/sh',
              },
              {
                title: '5. Stream events',
                detail: 'task start/exit, OOM, snapshot ops in real time',
                cmd: 'sudo ctr events',
              },
              {
                title: '6. Daemon logs',
                detail: 'pull failures, snapshot errors, shim exits',
                cmd: 'journalctl -u containerd -f',
              },
              {
                title: '7. Inspect overlay mounts',
                detail: 'Read upperdir files without entering the container',
                cmd: 'mount | grep overlay',
              },
            ],
          },
          {
            type: 'commands',
            title: 'Extra debug commands',
            items: [
              { cmd: 'sudo ctr tasks metrics my-nginx', note: 'CPU / memory / IO / PIDs' },
              { cmd: 'sudo ctr tasks ps my-nginx', note: 'processes inside task' },
              { cmd: 'sudo ctr containers info my-nginx' },
              { cmd: 'sudo ctr --debug images pull docker.io/library/nginx:latest' },
              { cmd: 'sudo systemctl status containerd' },
            ],
          },
          {
            type: 'code',
            title: 'Health check script (from ctr1.md)',
            lang: 'bash',
            code: `#!/bin/bash
echo "=== ContainerD Health Check ==="
systemctl is-active --quiet containerd && echo "containerd running" || exit 1
sudo ctr version
FAILED=$(sudo ctr plugins list | grep -c error || true)
echo "failed plugins: $FAILED"
echo "namespaces: $(sudo ctr namespaces list | grep -v NAME | wc -l)"
echo "tasks: $(sudo ctr tasks list | grep -v TASK | wc -l)"
echo "images: $(sudo ctr images list | grep -v REF | wc -l)"
echo "disk: $(sudo du -sh /var/lib/containerd 2>/dev/null | cut -f1)"`,
          },
          {
            type: 'steps',
            kind: 'lab',
            title: 'Lab: run the full 7-step debug flow end to end',
            goal: 'Reach a real task\'s filesystem and process tree from the host, using only the 7 steps above - no docker exec, no high-level client.',
            steps: [
              { title: '1. Get task PID', detail: 'Every later step depends on this PID.', cmd: 'sudo ctr tasks list' },
              { title: '2. Inspect namespaces', detail: 'Confirm the namespace inode numbers under /proc/<PID>/ns/.', cmd: 'ls -la /proc/<PID>/ns/' },
              { title: '3. nsenter', detail: 'Drop into the exact namespaces the container sees.', cmd: 'sudo nsenter -t <PID> --net --pid --mount --uts /bin/sh' },
              { title: '4. ctr tasks exec (alternative path)', detail: 'Same namespaces + cgroups + security profile, via containerd instead of nsenter.', cmd: 'sudo ctr tasks exec --exec-id debug -t my-container /bin/sh' },
              { title: '5. Stream events', detail: 'Confirm the daemon sees this task as healthy in real time.', cmd: 'sudo ctr events' },
              { title: '6. Daemon logs', detail: 'Rule out pull/snapshot/shim errors at the daemon level.', cmd: 'journalctl -u containerd -f' },
              { title: '7. Inspect overlay mounts', detail: 'Read the container\'s files directly from the host, no shell inside required.', cmd: 'mount | grep overlay' },
              { title: 'Verify', detail: 'You reached the container\'s process and filesystem entirely through host tools (nsenter/ctr/mount) - no docker exec, no dashboard - proving containerd needs no high-level client to be debuggable.', cmd: 'echo "debugged without docker"' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'production',
    part: 'Part 2 · Internals',
    title: 'Production Ops',
    short: 'Prod',
    icon: 'Settings',
    lessons: [
      {
        id: 'prod-config',
        title: 'config.toml Deep Dive',
        blocks: [
          {
            type: 'callout',
            variant: 'tip',
            title: 'Generate defaults',
            body: 'If missing: sudo containerd config default > /etc/containerd/config.toml then restart containerd.',
          },
          {
            type: 'code',
            title: '/etc/containerd/config.toml (essential structure)',
            lang: 'toml',
            code: `version = 2
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
    endpoint = ["https://registry-1.docker.io"]`,
          },
          {
            type: 'list',
            title: 'Three files that matter in prod',
            items: [
              'config.toml - daemon behavior, plugins, GC, metrics, runtimes',
              'hosts.toml per registry under certs.d - auth, mirrors, TLS',
              'Runtime/shim config - alternative runtimes (gVisor/Kata)',
            ],
          },
        ],
      },
      {
        id: 'prod-gc-metrics-reg',
        title: 'GC, Metrics, Private Registry',
        blocks: [
          {
            type: 'text',
            title: 'Garbage collection',
            body: 'containerd does not always delete unused images/snapshots immediately. GC runs by policy/thresholds; unused content can linger until GC. Monitor disk under /var/lib/containerd.',
          },
          {
            type: 'commands',
            title: 'Metrics',
            items: [
              { cmd: 'curl http://localhost:1338/v1/metrics', note: 'Prometheus endpoint (enable in config.toml)' },
            ],
          },
          {
            type: 'list',
            title: 'Sample metrics',
            items: [
              'containerd_containers_count',
              'containerd_images_count',
              'containerd_task_cpu_total_seconds',
              'containerd_task_memory_usage_bytes',
            ],
          },
          {
            type: 'code',
            title: 'Private registry hosts.toml sketch',
            lang: 'toml',
            code: `# /etc/containerd/certs.d/my-registry.example.com/hosts.toml
server = "https://my-registry.example.com"

[host."https://my-registry.example.com"]
  capabilities = ["pull", "resolve", "push"]
  # ca = "/etc/containerd/certs.d/my-registry.example.com/ca.crt"
  # [host."https://my-registry.example.com".header]
  #   authorization = "Basic <base64>"`,
          },
          {
            type: 'commands',
            title: 'Leases (protect content from GC)',
            items: [
              { cmd: 'sudo ctr leases list' },
              { cmd: 'sudo ctr leases create my-lease' },
              { cmd: 'sudo ctr leases add my-lease <resource>' },
              { cmd: 'sudo ctr leases delete my-lease' },
            ],
          },
          {
            type: 'steps',
            kind: 'lab',
            title: 'Lab: run GC and confirm unreferenced content is reclaimed',
            goal: 'Run garbage collection and confirm unreferenced content is actually reclaimed from disk.',
            steps: [
              { title: 'Pull an image', detail: 'Creates fresh, referenced content-store blobs.', cmd: 'sudo ctr images pull docker.io/library/alpine:latest' },
              { title: 'Check disk usage', detail: 'Baseline before removing anything.', cmd: 'sudo du -sh /var/lib/containerd/io.containerd.content.v1.content/' },
              { title: 'Remove the image reference only', detail: 'This drops the tag/reference but the underlying blobs are not deleted immediately - they become unreferenced, not gone.', cmd: 'sudo ctr images rm docker.io/library/alpine:latest' },
              { title: 'Confirm blobs still linger', detail: 'containerd does not always delete unused content immediately - it waits for GC.', cmd: 'sudo ctr content list' },
              { title: 'Trigger GC', detail: 'Forces containerd to reclaim anything with no live reference or lease.', cmd: 'sudo ctr namespaces list && sudo systemctl reload containerd' },
              { title: 'Verify', detail: 'Disk usage of the content store drops and the orphaned blobs no longer show up in ctr content list - proof GC actually reclaimed them rather than just marking them.', cmd: 'sudo du -sh /var/lib/containerd/io.containerd.content.v1.content/ && sudo ctr content list' },
            ],
          },
        ],
      },
      {
        id: 'prod-storage-layout',
        title: 'Full Storage Layout',
        blocks: [
          {
            type: 'tree',
            lines: [
              '/var/lib/containerd/',
              '├── io.containerd.content.v1.content/',
              '│   ├── blobs/sha256/   # layers + configs by hash',
              '│   └── ingest/         # temp downloads',
              '├── io.containerd.snapshotter.v1.overlayfs/',
              '│   ├── snapshots/1|2|3/fs',
              '│   └── metadata.db',
              '├── io.containerd.metadata.v1.bolt/meta.db',
              '└── (runtime state often under /run/containerd/...)',
            ],
          },
        ],
      },
    ],
  },
];
