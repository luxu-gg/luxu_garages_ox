import { useEffect, useRef, useState } from 'react';
import { isEnvBrowser } from './utils/misc';
import { useNuiEvent } from './hooks/useNuiEvent';
import { fetchNui } from './utils/fetchNui';
import { Withdraw } from './pages/Withdraw';
import type { Config } from '@common/config';
import { useSetAtom } from 'jotai';
import { userConfig } from './utils/config';
import { localesAtom } from './utils/locales';
import type { RawLocales } from '@common/locale';

function App() {
  const [menu, setMenu] = useState<string | false | null>(isEnvBrowser() ? 'withdraw' : null);
  const setUserConfig = useSetAtom(userConfig);
  const setLocales = useSetAtom(localesAtom);
  const containerEl = useRef<HTMLDivElement>(null);

  useNuiEvent('getConfigAndLocales', ({ config, locales }: { config: Config; locales: Record<RawLocales, string> }) => {
    setUserConfig(config);
    setLocales(locales);
  });
  useNuiEvent('setMenu', (data: { menu?: string }) => {
    setMenu(data.menu || false);
  });

  function close() {
    void fetchNui('exit');
    setMenu(false);
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
      <div ref={containerEl}>{menu !== null && <Withdraw isVisible={menu === 'withdraw'} close={close} />}</div>
    </div>
  );
}

export default App;
