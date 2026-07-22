import type { Module } from '../types';

export const part4Modules: Module[] = [
  {
    id: 'features',
    part: 'Part 4 · Features & Future',
    title: 'Key Features',
    short: 'Features',
    icon: 'Zap',
    lessons: [
      {
        id: 'feat-advanced',
        title: 'Encryption, Lazy Pull, CNI, CRIU, Metrics',
        blocks: [
          {
            type: 'commands',
            title: 'Image encryption (nerdctl)',
            items: [
              {
                cmd: 'nerdctl image encrypt --recipient=jwe:pubkey.pem myapp:latest myapp:encrypted',
              },
              { cmd: 'nerdctl push myapp:encrypted' },
              { cmd: 'nerdctl pull myapp:encrypted' },
              { cmd: 'nerdctl run --decrypt=privkey.pem myapp:encrypted' },
            ],
          },
          {
            type: 'commands',
            title: 'Lazy pulling (stargz)',
            items: [
              {
                cmd: 'nerdctl run --snapshotter=stargz nginx:latest',
                note: 'starts immediately; layers pull on demand - up to ~80% faster cold start in ideal cases',
              },
            ],
          },
          {
            type: 'code',
            title: 'CNI example /etc/cni/net.d/10-mynet.conf',
            lang: 'json',
            code: `{
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
}`,
          },
          {
            type: 'list',
            title: 'CNI plugins you will meet',
            items: ['bridge', 'ipvlan/macvlan', 'flannel', 'Calico', 'Cilium (eBPF)', 'Weave'],
          },
          {
            type: 'commands',
            title: 'Checkpoint/restore (nerdctl)',
            items: [
              { cmd: 'nerdctl checkpoint create mycontainer checkpoint1' },
              { cmd: 'nerdctl start --checkpoint=checkpoint1 mycontainer' },
            ],
          },
          {
            type: 'list',
            title: 'CRIU use cases',
            items: ['Live migration', 'Debug freeze/thaw', 'Disaster recovery drills', 'Faster warm starts'],
          },
          {
            type: 'steps',
            kind: 'lab',
            title: 'Lab: normal pull vs lazy pull cold start',
            goal: 'Compare cold-start time of a normal pull vs a lazy pull (stargz) snapshotter.',
            steps: [
              { title: 'Time a normal cold start', detail: 'Pull happens fully before the container can run - time the whole thing.', cmd: 'time nerdctl run --rm docker.io/library/nginx:latest nginx -v' },
              { title: 'Time a lazy-pull cold start', detail: 'With the stargz snapshotter, layers stream in on demand instead of all up front.', cmd: 'time nerdctl run --rm --snapshotter=stargz ghcr.io/stargz-containers/nginx:latest-esgz nginx -v' },
              { title: 'Notice the gap', detail: 'The stargz run becomes responsive noticeably faster, even though total layer transfer isn’t complete yet - only the bytes needed to start are fetched first.' },
              { title: 'Verify', detail: 'Compare the two `time` outputs: the stargz run’s wall-clock time to a usable process is meaningfully lower, confirming lazy pull is working.', cmd: 'nerdctl ps' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'usecases',
    part: 'Part 4 · Features & Future',
    title: 'Real-World Use Cases',
    short: 'Use cases',
    icon: 'Globe',
    lessons: [
      {
        id: 'use-all',
        title: 'Where containerd shines',
        blocks: [
          {
            type: 'cards',
            items: [
              {
                title: 'Large-scale Kubernetes',
                body: 'Default on EKS/GKE/AKS. Direct CRI, low overhead, millions of nodes.',
                tag: 'K8s',
                color: 'mcb',
              },
              {
                title: 'Edge / IoT',
                body: 'Small binary (~30MB), low idle RAM, ARM-friendly.',
                tag: 'Edge',
                color: 'green',
              },
              {
                title: 'CI/CD runners',
                body: 'Fast pull + start; clean namespaces per job; easy wipe of content store.',
                tag: 'CI',
                color: 'blue',
              },
              {
                title: 'Multi-tenant platforms',
                body: 'ctr namespaces per customer/team; resource isolation for accounting.',
                tag: 'SaaS',
                color: 'orange',
              },
              {
                title: 'Serverless',
                body: 'Firecracker/microVM runtimes; CRIU warm starts; stargz lazy images.',
                tag: 'FaaS',
                color: 'yellow',
              },
            ],
          },
          {
            type: 'table',
            title: 'Why it matters (efficiency)',
            headers: ['Metric', 'Docker Engine', 'ContainerD'],
            rows: [
              ['Memory idle', '150 MB', '30 MB'],
              ['Memory / container', '+5 MB', '+1 MB'],
              ['Startup', '2–3s', '<1s'],
              ['Launch', '800ms', '500ms'],
              ['CPU idle', '1–2%', '<0.5%'],
            ],
          },
          {
            type: 'diagram',
            title: 'K8s market share (approx.)',
            lines: [
              'ContainerD  ████████████████████████████  75%',
              'CRI-O       ███████                      20%',
              'Others      ██                            5%',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'future',
    part: 'Part 4 · Features & Future',
    title: 'Future & Bridge to Kubernetes',
    short: 'Future',
    icon: 'Award',
    lessons: [
      {
        id: 'future-trends',
        title: 'Trends & Emerging Tech',
        blocks: [
          {
            type: 'list',
            title: 'Current trends',
            items: [
              'Rootless containers by default more often',
              'WASM workloads beside Linux containers',
              'Stronger sandboxing (gVisor/Kata/confidential)',
              'Faster startup + lower overhead',
              'Better Windows parity',
            ],
          },
          {
            type: 'list',
            title: 'Emerging',
            items: [
              'Lazy pull evolution: HTTP/3, P2P layers, CDN',
              'eBPF security policies + hardware isolation',
              'CSI / distributed storage backends',
              'Edge offline modes + ARM64 optimization',
              'Confidential computing / TEE integration',
              'AI/ML GPU container workloads',
            ],
          },
          {
            type: 'code',
            title: 'Go client sketch (gRPC API)',
            lang: 'go',
            code: `client, _ := containerd.New("/run/containerd/containerd.sock")
defer client.Close()
ctx := namespaces.WithNamespace(context.Background(), "default")
image, _ := client.Pull(ctx, "docker.io/library/nginx:latest")
container, _ := client.NewContainer(ctx, "nginx-1",
  containerd.WithNewSnapshot("nginx-1-snapshot", image),
  containerd.WithNewSpec(),
)
task, _ := container.NewTask(ctx, cio.NewCreator())
task.Start(ctx)`,
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Key takeaways',
            body: 'containerd is the engine under Docker and most Kubernetes clusters. Efficient, graduated CNCF project, multi-runtime, production battle-tested. Next chapter of this adventure: Kubernetes orchestration on top of this engine.',
          },
          {
            type: 'list',
            title: 'Part 3 video topics (K8s/CRI - next in your series)',
            items: [
              'CRI plugin architecture',
              'kubelet ↔ containerd gRPC flow',
              'Pod sandbox (pause container)',
              'Kubernetes 1.24 dockershim removal details',
              'containerd on EKS / GKE / AKS',
            ],
          },
        ],
      },
    ],
  },
];
