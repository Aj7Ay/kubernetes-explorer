import { useState } from 'react';
import { GameContainer } from './components/GameContainer';
import { SidePanel } from './components/SidePanel';
import { Chatbot } from './components/Chatbot';
import { Intro, Containers, KubernetesIntro, Pods, Nodes, ReplicaSets, Services, Ingress } from './levels';
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
    if (currentLevel === 'kubernetes-intro') return k8sInitialStep === 8 ? 3 : 2;
    if (currentLevel === 'pods') return 4;
    if (currentLevel === 'nodes') return 5;
    if (currentLevel === 'replicasets') return 6;
    if (currentLevel === 'services') return 7;
    if (currentLevel === 'ingress') return 8;
    return 0;
  };

  const handleNavigate = (stepIndex: number) => {
    // 0: Intro, 1: Containers, 2: K8s Intro, 3: Grand Fleet, 4: Pods, etc.
    if (stepIndex === 0) { setCurrentLevel('intro'); }
    else if (stepIndex === 1) { setCurrentLevel('containers'); }
    else if (stepIndex === 2) { 
      setCurrentLevel('kubernetes-intro'); 
      setK8sInitialStep(0); 
    }
    else if (stepIndex === 3) { 
      setCurrentLevel('kubernetes-intro'); 
      setK8sInitialStep(8); 
    }
    else if (stepIndex === 4) { setCurrentLevel('pods'); }
    else if (stepIndex === 5) { setCurrentLevel('nodes'); }
    else if (stepIndex === 6) { setCurrentLevel('replicasets'); }
    else if (stepIndex === 7) { setCurrentLevel('services'); }
    else if (stepIndex === 8) { setCurrentLevel('ingress'); }
  };

  const renderLevel = () => {
    switch (currentLevel) {
      case 'intro':
        return <Intro onComplete={() => handleNext('containers')} />;
      case 'containers':
        return <Containers onComplete={() => handleNext('kubernetes-intro')} />;
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
    <>
      <SidePanel currentStep={getCurrentStepIndex()} onNavigate={handleNavigate} />
      <GameContainer currentLevel={currentLevel} onNavigate={setCurrentLevel}>
        {renderLevel()}
      </GameContainer>
      <Chatbot />
    </>
  );
}

export default App;
