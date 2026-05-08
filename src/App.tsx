import { useState } from 'react';
import { Wizard } from './components/Wizard';
import { HistoricalDataViewer } from './components/HistoricalDataViewer';
import { PolicyViewer } from './components/PolicyViewer';

type View = 'wizard' | 'historical' | 'policy';

function App() {
  const [view, setView] = useState<View>('wizard');

  if (view === 'historical') {
    return <HistoricalDataViewer onClose={() => setView('wizard')} />;
  }

  if (view === 'policy') {
    return <PolicyViewer onClose={() => setView('wizard')} />;
  }

  return (
    <Wizard
      onShowHistoricalData={() => setView('historical')}
      onShowPolicy={() => setView('policy')}
    />
  );
}

export default App;
