import { useEffect, useRef, useState } from 'react';
import { isEnvBrowser } from './utils/misc';
import { useNuiEvent } from './hooks/useNuiEvent';
import { fetchNui } from './utils/fetchNui';
import { Withdraw } from './pages/withdraw';
import type { Config } from '@common/config';
import { useSetAtom } from 'jotai';
import { userConfig } from './utils/config';

function App() {
  const [menu, setMenu] = useState(isEnvBrowser() ? 'withdraw' : false);
  const setUserConfig = useSetAtom(userConfig);
  const containerEl = useRef<HTMLDivElement>(null);

  useNuiEvent('getConfig', (config: Config) => {
    setUserConfig(config);
  });
  useNuiEvent('setMenu', (data: { menu?: string }) => {
    containerEl.current?.animate(
      [
        { opacity: 0, transform: 'translateY(20vh)' },
        { opacity: 1, transformY: 'translateY(0)' },
      ],
      {
        duration: 200,
        easing: 'ease-in',
        fill: 'forwards',
      }
    );
    setMenu(data.menu || false);
  });

  function close() {
    void fetchNui('exit');
    if (!containerEl.current) return;
    containerEl.current.animate(
      [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(20vh)' },
      ],
      {
        duration: 200,
        easing: 'ease-out',
        fill: 'forwards',
      }
    ).onfinish = () => {
      setMenu(false);
    };
  }

  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        close();
      }
    });
  }, []);

  return (
    <div className="boilerplate-wrapper">
      <div ref={containerEl}>{menu == 'withdraw' && <Withdraw close={close} />}</div>
    </div>
  );
}

export default App;
