import { useState } from 'react';
import { ThemeProvider } from './ThemeContext';
import { GameContainer } from './components/GameContainer';
import { SidePanel } from './components/SidePanel';
import { Chatbot } from './components/Chatbot';
import { Intro, Containers, Containerd, KubernetesIntro, Pods, Nodes, ReplicaSets, Services, Ingress } from './levels';
import type { LevelId } from './types';

function App() {
  const [currentLevel, setCurrentLevel] = useState<LevelId>('intro');
  const [completedLevels, setCompletedLevels] = useState<LevelId[]>([]);
  const [k8sInitialStep, setK8sInitialStep] = useState(0);

  const markComplete = (level: LevelId) => {
    if (!completedLevels.includes(level)) {
      setCompletedLevels([...completedLevels, level]);
    }
  };

  const handleNext = (nextLevel: LevelId) => {
    markComplete(currentLevel);
    setCurrentLevel(nextLevel);
    setK8sInitialStep(0); // Reset to default
  };

  const getCurrentStepIndex = () => {
    if (currentLevel === 'intro') return 0;
    if (currentLevel === 'containers') return 1;
    if (currentLevel === 'containerd') return 2;
    if (currentLevel === 'kubernetes-intro') return k8sInitialStep === 8 ? 4 : 3;
    if (currentLevel === 'pods') return 5;
    if (currentLevel === 'nodes') return 6;
    if (currentLevel === 'replicasets') return 7;
    if (currentLevel === 'services') return 8;
    if (currentLevel === 'ingress') return 9;
    return 0;
  };

  const handleNavigate = (stepIndex: number) => {
    // 0: Intro, 1: Containers, 2: ContainerD, 3: K8s Intro, 4: Grand Fleet, 5: Pods, etc.
    if (stepIndex === 0) { setCurrentLevel('intro'); }
    else if (stepIndex === 1) { setCurrentLevel('containers'); }
    else if (stepIndex === 2) { setCurrentLevel('containerd'); }
    else if (stepIndex === 3) {
      setCurrentLevel('kubernetes-intro');
      setK8sInitialStep(0);
    }
    else if (stepIndex === 4) {
      setCurrentLevel('kubernetes-intro');
      setK8sInitialStep(8);
    }
    else if (stepIndex === 5) { setCurrentLevel('pods'); }
    else if (stepIndex === 6) { setCurrentLevel('nodes'); }
    else if (stepIndex === 7) { setCurrentLevel('replicasets'); }
    else if (stepIndex === 8) { setCurrentLevel('services'); }
    else if (stepIndex === 9) { setCurrentLevel('ingress'); }
  };

  const renderLevel = () => {
    switch (currentLevel) {
      case 'intro':
        return <Intro onComplete={() => handleNext('containers')} />;
      case 'containers':
        return <Containers onComplete={() => handleNext('containerd')} />;
      case 'containerd':
        return <Containerd onComplete={() => handleNext('kubernetes-intro')} />;
      case 'kubernetes-intro':
        return <KubernetesIntro onComplete={() => handleNext('pods')} initialStep={k8sInitialStep} />;
      case 'pods':
        return <Pods onComplete={() => handleNext('nodes')} />;
      case 'nodes':
        return <Nodes onComplete={() => handleNext('replicasets')} />;
      case 'replicasets':
        return <ReplicaSets onComplete={() => handleNext('services')} />;
      case 'services':
        return <Services onComplete={() => handleNext('ingress')} />;
      case 'ingress':
        return <Ingress onComplete={() => setCurrentLevel('intro')} />;
      default:
        return <Intro onComplete={() => handleNext('containers')} />;
    }
  };

  return (
    <ThemeProvider>
      <SidePanel currentStep={getCurrentStepIndex()} onNavigate={handleNavigate} />
      <GameContainer currentLevel={currentLevel} onNavigate={setCurrentLevel}>
        {renderLevel()}
      </GameContainer>
      <Chatbot />
    </ThemeProvider>
  );
}

export default App;
