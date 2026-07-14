import type { Module } from '../types';

export const part3Modules: Module[] = [
  {
    id: 'ctr-basics',
    part: 'Part 3 · ctr CLI',
    title: 'ctr Philosophy & Concepts',
    short: 'ctr intro',
    icon: 'Terminal',
    lessons: [
      {
        id: 'ctr-what',
        title: 'What is ctr?',
        blocks: [
          {
            type: 'text',
            body: 'ctr is the official CLI client for containerd - a debugging and admin tool with direct API mapping. Think diagnostic port, not dashboard.',
          },
          {
            type: 'compare',
            left: {
              title: 'USE ctr when',
              items: [
                'Debugging containerd itself',
                'Learning internals (images vs containers vs tasks)',
                'Scripting low-level ops',
                'Testing containerd without Docker',
                'Working with namespaces explicitly',
              ],
            },
            right: {
              title: "DON'T use ctr when",
              items: [
                'Daily app development → nerdctl/docker',
                'Need Compose → docker/nerdctl compose',
                'Need build → docker/nerdctl build',
                'Want friendly UX → nerdctl',
                'Managing K8s apps → kubectl + crictl',
              ],
            },
          },
          {
            type: 'diagram',
            lines: [
              'docker / nerdctl / kubectl   = driving dashboard',
              'ctr / crictl                 = mechanic diagnostic tool',
              'containerd                   = the engine',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Design philosophy',
            body: 'Minimal, explicit, verbose. Direct mapping to APIs. Intentionally not user-friendly - it was never meant to be Docker.',
          },
        ],
      },
      {
        id: 'ctr-concepts',
        title: 'Core Concepts for ctr',
        blocks: [
          {
            type: 'demo',
            demoId: 'DemoContainerVsTask',
          },
          {
            type: 'cards',
            items: [
              {
                title: 'Full image refs',
                body: 'No Docker shorthand. Always docker.io/library/nginx:latest (registry/namespace/image:tag).',
                tag: 'refs',
                color: 'red',
              },
              {
                title: 'Container ≠ Task',
                body: 'Container = metadata. Task = running process with PID. Docker merges them; containerd splits them.',
                tag: 'split',
                color: 'yellow',
              },
              {
                title: 'Namespaces',
                body: 'Every command is namespace-scoped. Default is default; K8s uses k8s.io; Docker uses moby.',
                tag: '-n',
                color: 'mcb',
              },
              {
                title: 'Snapshots',
                body: 'Images unpack to snapshots; containers get writable snapshots on top.',
                tag: 'fs',
                color: 'orange',
              },
            ],
          },
          {
            type: 'commands',
            title: 'Wrong vs right image pull',
            items: [
              { cmd: 'sudo ctr images pull nginx', note: '❌ WRONG - missing full reference' },
              { cmd: 'sudo ctr images pull docker.io/library/nginx:latest', note: '✅ CORRECT' },
            ],
          },
          {
            type: 'commands',
            title: 'Container vs task demo',
            items: [
              { cmd: 'sudo ctr images pull docker.io/library/nginx:latest' },
              { cmd: 'sudo ctr containers create docker.io/library/nginx:latest my-nginx' },
              { cmd: 'sudo ctr containers list', note: 'shows my-nginx' },
              { cmd: 'sudo ctr tasks list', note: 'empty - nothing running yet' },
              { cmd: 'sudo ctr tasks start -d my-nginx' },
              { cmd: 'sudo ctr tasks list', note: 'now has PID + status' },
            ],
          },
          {
            type: 'code',
            title: 'General syntax',
            lang: 'bash',
            code: `ctr [global-options] <command> [command-options] [arguments]

# Globals you will use constantly
sudo ctr --namespace=production images list
sudo ctr -n production images list
sudo ctr --address /run/containerd/containerd.sock version
sudo ctr --connect-timeout 30s version
sudo ctr --debug images pull docker.io/library/nginx:latest

# Help
ctr --help
ctr images --help
ctr images pull --help`,
          },
        ],
      },
    ],
  },
  {
    id: 'ctr-images',
    part: 'Part 3 · ctr CLI',
    title: 'Images Command Reference',
    short: 'Images',
    icon: 'Package',
    lessons: [
      {
        id: 'ctr-images-all',
        title: 'Pull, List, Tag, RM, Export/Import, Labels',
        blocks: [
          {
            type: 'commands',
            title: 'Pull',
            items: [
              { cmd: 'sudo ctr images pull docker.io/library/nginx:latest' },
              { cmd: 'sudo ctr images pull docker.io/library/nginx:1.25.3' },
              { cmd: 'sudo ctr images pull docker.io/library/nginx:alpine' },
              { cmd: 'sudo ctr images pull registry.k8s.io/pause:3.9' },
              { cmd: 'sudo ctr images pull --platform linux/amd64 docker.io/library/alpine:latest' },
              { cmd: 'sudo ctr images pull --platform linux/arm64 docker.io/library/alpine:latest' },
              { cmd: 'sudo ctr --namespace=production images pull docker.io/library/nginx:latest' },
              { cmd: 'sudo ctr images pull --user username:password docker.io/library/private-image:latest' },
              { cmd: 'sudo ctr images pull --all-platforms docker.io/library/nginx:latest' },
            ],
          },
          {
            type: 'commands',
            title: 'List',
            items: [
              { cmd: 'sudo ctr images list' },
              { cmd: 'sudo ctr images list --quiet' },
              { cmd: 'sudo ctr images list -q' },
              { cmd: 'sudo ctr --namespace=production images list' },
              { cmd: 'sudo ctr images list | grep nginx' },
            ],
          },
          {
            type: 'commands',
            title: 'Tag / remove',
            items: [
              {
                cmd: 'sudo ctr images tag docker.io/library/nginx:latest myregistry.local/webserver:v1',
              },
              { cmd: 'sudo ctr images tag nginx:latest nginx:dev' },
              { cmd: 'sudo ctr images remove docker.io/library/nginx:latest' },
              { cmd: 'sudo ctr images rm docker.io/library/nginx:latest' },
              { cmd: 'sudo ctr images remove --force docker.io/library/nginx:latest' },
              { cmd: 'sudo ctr images rm nginx:dev nginx:staging nginx:prod' },
              { cmd: 'sudo ctr images list -q | grep nginx | xargs -r sudo ctr images rm' },
            ],
          },
          {
            type: 'commands',
            title: 'Export / import',
            items: [
              { cmd: 'sudo ctr images export nginx.tar docker.io/library/nginx:latest' },
              {
                cmd: 'sudo ctr images export - docker.io/library/nginx:latest | gzip > nginx.tar.gz',
              },
              {
                cmd: 'sudo ctr images export multi.tar docker.io/library/nginx:latest docker.io/library/redis:alpine',
              },
              { cmd: 'sudo ctr images import nginx.tar' },
              { cmd: 'gunzip -c nginx.tar.gz | sudo ctr images import -' },
              { cmd: 'sudo ctr --namespace=production images import nginx.tar' },
            ],
          },
          {
            type: 'commands',
            title: 'Labels',
            items: [
              { cmd: 'sudo ctr images label docker.io/library/nginx:latest' },
              { cmd: 'sudo ctr images label docker.io/library/nginx:latest version=1.25' },
              {
                cmd: 'sudo ctr images label nginx:latest maintainer=admin@example.com environment=production',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ctr-containers-tasks',
    part: 'Part 3 · ctr CLI',
    title: 'Containers & Tasks',
    short: 'C & T',
    icon: 'Box',
    lessons: [
      {
        id: 'ctr-containers',
        title: 'Container Operations',
        blocks: [
          {
            type: 'commands',
            title: 'Create / list / info / labels / remove',
            items: [
              { cmd: 'sudo ctr containers create docker.io/library/nginx:latest my-nginx' },
              {
                cmd: 'sudo ctr containers create --snapshotter overlayfs docker.io/library/nginx:latest my-nginx',
              },
              {
                cmd: 'sudo ctr --namespace=production containers create docker.io/library/nginx:latest prod-nginx',
              },
              {
                cmd: 'sudo ctr containers create --label app=web --label version=v1 docker.io/library/nginx:latest web-server',
              },
              { cmd: 'sudo ctr containers list' },
              { cmd: 'sudo ctr containers ls' },
              { cmd: 'sudo ctr c ls' },
              { cmd: 'sudo ctr containers list -q' },
              { cmd: 'sudo ctr --namespace=k8s.io containers list' },
              { cmd: 'sudo ctr containers info my-nginx' },
              { cmd: 'sudo ctr containers label my-nginx' },
              { cmd: 'sudo ctr containers remove my-nginx' },
              { cmd: 'sudo ctr containers rm my-nginx' },
              { cmd: 'sudo ctr containers delete my-nginx' },
              { cmd: 'sudo ctr containers list -q | xargs -r sudo ctr containers rm' },
            ],
          },
        ],
      },
      {
        id: 'ctr-tasks',
        title: 'Task Operations',

        blocks: [
          {
            type: 'commands',
            title: 'ctr run (pull+create+start shortcut)',
            items: [
              { cmd: 'sudo ctr run --rm docker.io/library/alpine:latest test echo "Hello World"' },
              { cmd: 'sudo ctr run -t --rm docker.io/library/alpine:latest shell /bin/sh' },
              { cmd: 'sudo ctr run -d docker.io/library/nginx:latest web-server' },
              {
                cmd: 'sudo ctr run -d --env MYSQL_ROOT_PASSWORD=secret --env MYSQL_DATABASE=mydb docker.io/library/mysql:8.0 mysql-db',
              },
              {
                cmd: 'sudo ctr run -d --memory-limit 536870912 --cpu-quota 50000 docker.io/library/nginx:latest limited-nginx',
              },
              { cmd: 'sudo ctr run -d --net-host docker.io/library/nginx:latest host-nginx' },
              {
                cmd: 'sudo ctr run -d --mount type=bind,src=/data,dst=/app/data,options=rbind:rw docker.io/library/nginx:latest data-nginx',
              },
            ],
          },
          {
            type: 'commands',
            title: 'Start / list / metrics / exec',
            items: [
              { cmd: 'sudo ctr tasks start my-nginx' },
              { cmd: 'sudo ctr tasks start -d my-nginx' },
              { cmd: 'sudo ctr tasks start --null-io my-nginx' },
              { cmd: 'sudo ctr tasks list' },
              { cmd: 'sudo ctr tasks ls' },
              { cmd: 'sudo ctr t ls' },
              { cmd: 'sudo ctr --namespace=k8s.io tasks list' },
              { cmd: 'sudo ctr tasks metrics my-nginx' },
              { cmd: 'sudo ctr tasks ps my-nginx' },
              { cmd: 'sudo ctr tasks exec --exec-id bash-session -t my-nginx /bin/bash' },
              { cmd: 'sudo ctr tasks exec --exec-id check my-nginx ls -la /' },
              {
                cmd: 'sudo ctr tasks exec --exec-id env-test --env VAR1=value1 my-nginx env',
              },
              {
                cmd: 'sudo ctr tasks exec --exec-id user-test --user 1000:1000 my-nginx whoami',
              },
            ],
          },
          {
            type: 'commands',
            title: 'Pause / resume / kill / delete',
            items: [
              { cmd: 'sudo ctr tasks pause my-nginx' },
              { cmd: 'sudo ctr tasks resume my-nginx' },
              { cmd: 'sudo ctr tasks kill my-nginx', note: 'SIGTERM' },
              { cmd: 'sudo ctr tasks kill --signal SIGKILL my-nginx' },
              { cmd: 'sudo ctr tasks kill --signal SIGHUP my-nginx' },
              {
                cmd: 'sudo ctr --namespace=testing tasks list -q | xargs -r sudo ctr tasks kill',
              },
              { cmd: 'sudo ctr tasks delete my-nginx' },
              { cmd: 'sudo ctr tasks delete --force my-nginx' },
            ],
          },
          {
            type: 'steps',
            title: 'Full 3-step workflow (from ctr2 video)',
            steps: [
              { title: 'Pull', detail: 'Get layers into content store', cmd: 'sudo ctr images pull docker.io/library/nginx:alpine' },
              { title: 'Create', detail: 'Metadata only', cmd: 'sudo ctr containers create docker.io/library/nginx:alpine web-app' },
              { title: 'Start task', detail: 'Process launches', cmd: 'sudo ctr tasks start -d web-app' },
              { title: 'Verify', detail: 'See PID/status', cmd: 'sudo ctr tasks list | grep web-app' },
              { title: 'Metrics', detail: 'Resource usage', cmd: 'sudo ctr tasks metrics web-app' },
              { title: 'Exec', detail: 'In-task command', cmd: 'sudo ctr tasks exec --exec-id test -t web-app /bin/sh -c "nginx -v"' },
              { title: 'Kill', detail: 'Stop process', cmd: 'sudo ctr tasks kill web-app' },
              { title: 'Delete task', detail: 'Remove task object', cmd: 'sudo ctr tasks delete web-app' },
              { title: 'Remove container', detail: 'Remove metadata', cmd: 'sudo ctr containers remove web-app' },
            ],
          },
        ],
      },
      {
        id: 'ctr-ns-examples',
        title: 'Namespaces + Practical Scripts',
        blocks: [
          {
            type: 'code',
            title: 'Multi-namespace setup',
            lang: 'bash',
            code: `sudo ctr namespaces create development
sudo ctr namespaces create staging
sudo ctr namespaces create production

sudo ctr --namespace=development images pull docker.io/library/nginx:alpine
sudo ctr --namespace=development run -d docker.io/library/nginx:alpine dev-web

sudo ctr --namespace=staging images pull docker.io/library/nginx:1.25
sudo ctr --namespace=staging run -d docker.io/library/nginx:1.25 staging-web

sudo ctr --namespace=production images pull docker.io/library/nginx:1.24
sudo ctr --namespace=production run -d docker.io/library/nginx:1.24 prod-web

sudo ctr --namespace=development tasks list
sudo ctr --namespace=staging tasks list
sudo ctr --namespace=production tasks list`,
          },
          {
            type: 'code',
            title: 'Backup images script sketch',
            lang: 'bash',
            code: `BACKUP_DIR="/backup/containerd/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"
sudo ctr images list -q | while read image; do
  filename=$(echo "$image" | tr '/:' '-')
  sudo ctr images export "$BACKUP_DIR/\${filename}.tar" "$image"
done
sudo ctr namespaces list > "$BACKUP_DIR/namespaces.txt"`,
          },
          {
            type: 'commands',
            title: 'Checkpoint / restore (CRIU)',
            items: [
              { cmd: 'sudo apt install criu' },
              { cmd: 'sudo ctr run -d docker.io/library/nginx:latest web' },
              { cmd: 'sudo ctr tasks checkpoint --image-path /tmp/checkpoint web' },
              { cmd: 'sudo ctr tasks restore --image-path /tmp/checkpoint web' },
            ],
          },
          {
            type: 'commands',
            title: 'Custom netns',
            items: [
              { cmd: 'sudo ip netns add my-netns' },
              {
                cmd: 'sudo ctr run -d --net-ns /var/run/netns/my-netns docker.io/library/nginx:latest custom-net-nginx',
              },
            ],
          },
        ],
      },
    ],
  },
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
