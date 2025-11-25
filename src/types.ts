export type LevelId = 
  | 'intro'
  | 'containers'
  | 'kubernetes-intro'
  | 'pods'
  | 'nodes'
  | 'replicasets'
  | 'services'
  | 'ingress';

export interface Level {
  id: LevelId;
  title: string;
  description: string;
  component: React.ComponentType<{ onComplete: () => void }>;
}

export interface GameState {
  currentLevelId: LevelId;
  completedLevels: LevelId[];
}

