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
          {
            type: 'steps',
            kind: 'lab',
            title: 'Lab: wrong vs right pull, container vs task',
            goal: 'Do a wrong-vs-right image pull, then tell a container apart from a task.',
            steps: [
              { title: 'Wrong pull', detail: 'Try the Docker-style shorthand - ctr has no default registry/namespace, so this fails.', cmd: 'sudo ctr images pull nginx' },
              { title: 'Right pull', detail: 'Retry with the full reference: registry/namespace/image:tag.', cmd: 'sudo ctr images pull docker.io/library/nginx:latest' },
              { title: 'Create container', detail: 'Metadata only is written - no process exists yet.', cmd: 'sudo ctr containers create docker.io/library/nginx:latest lab-nginx' },
              { title: 'Confirm no task yet', detail: 'The container exists but nothing is running.', cmd: 'sudo ctr tasks list' },
              { title: 'Start the task', detail: 'Now a real process is spawned for the container.', cmd: 'sudo ctr tasks start -d lab-nginx' },
              { title: 'Verify', detail: 'tasks list now shows a PID for lab-nginx - proof that container (metadata) and task (running process) are separate objects.', cmd: 'sudo ctr tasks list | grep lab-nginx' },
            ],
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
          {
            type: 'steps',
            kind: 'lab',
            title: 'Lab: pull, tag, export, re-import',
            goal: 'Pull, tag, export, and re-import a real image using ctr.',
            steps: [
              { title: 'Pull', detail: 'Get the image into the local content store.', cmd: 'sudo ctr images pull docker.io/library/nginx:alpine' },
              { title: 'Tag', detail: 'Give the same content an additional, friendlier reference.', cmd: 'sudo ctr images tag docker.io/library/nginx:alpine nginx:lab' },
              { title: 'Export', detail: 'Serialize the image (all its layers + manifest) into a portable tar file.', cmd: 'sudo ctr images export nginx-lab.tar nginx:lab' },
              { title: 'Remove originals', detail: 'Delete both references so nothing is left locally.', cmd: 'sudo ctr images rm docker.io/library/nginx:alpine nginx:lab' },
              { title: 'Re-import', detail: 'Load the image back in from the tar file alone.', cmd: 'sudo ctr images import nginx-lab.tar' },
              { title: 'Verify', detail: 'images list shows the re-imported image, and it starts a task normally - the tar round-tripped it intact.', cmd: 'sudo ctr images list | grep nginx' },
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
            kind: 'lab',
            title: 'Full 3-step workflow (from ctr2 video)',
            goal: 'Run the full pull → create → start → verify → cleanup lifecycle for a real container using only ctr.',
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
];
