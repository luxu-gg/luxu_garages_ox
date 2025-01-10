import { useEffect, useState } from 'react';
import { fetchNui } from '../utils/fetchNui';
import type { OwnedVehicle } from '@common/types';
import { isEnvBrowser } from '../utils/misc';
import { mockupVehicles } from '../utils/mockups';
import { VehicleImage } from '../components/VehicleImage';
import { userConfig } from '../utils/config';
import { useAtomValue } from 'jotai';
import { localesAtom } from '../utils/locales';

export const Withdraw = (props: { close: () => void; isVisible: boolean }) => {
  type GarageKey = keyof typeof config.Garages;

  async function getVehicles() {
    return await fetchNui<{ vehicles: OwnedVehicle[]; location: GarageKey }>('getVehiclesAndLocation');
  }

  const { close, isVisible } = props;
  const [vehicles, setVehicles] = useState<OwnedVehicle[]>(isEnvBrowser() ? mockupVehicles : []);
  const [currentGarage, setCurrentGarage] = useState<GarageKey>('pillbox');
  const config = useAtomValue(userConfig);
  const locales = useAtomValue(localesAtom);
  const [garageName, setGarageName] = useState<string>('');

  async function vehicleAction(action: 'withdraw' | 'recover' | 'transfer', id: number) {
    const result = await fetchNui(action, id);
    if (action === 'withdraw' && result) {
      close();
    } else {
      setVehicles(
        vehicles.map((v) => {
          if (v.id === id) {
            v.stored = currentGarage;
          }
          return v;
        })
      );
    }
  }

  function VehicleUnknown(stored: string | null) {
    if (stored === null) {
      return <p className="block my-auto text-2xl text-center text-rhino-950">Outside</p>;
    }
  }
  function VehicleImpounded(stored: string | null, id: number) {
    if (stored === 'impound') {
      return (
        <button
          className="block w-full px-6 py-2 my-auto font-semibold text-center text-white transition-all rounded-lg button-bezel button-shadow bg-gradient-to-b from-wine-500 to-wine-600 hover:from-wine-600 hover:to-wine-700 active:from-wine-700 active:to-wine-800 active:scale-95"
          onClick={() => void vehicleAction('recover', id)}
        >
          {locales.recover}
        </button>
      );
    }
  }
  function VehicleTransfer(stored: string | null, id: number) {
    if (stored && stored !== 'impound' && stored !== currentGarage) {
      return (
        <button
          className="block w-full px-6 py-2 my-auto font-semibold text-center text-white transition-all rounded-lg button-bezel button-shadow bg-gradient-to-b from-affair-500 to-affair-600 hover:from-affair-600 hover:to-affair-700 active:from-affair-700 active:to-affair-800 active:scale-95"
          onClick={() => void vehicleAction('transfer', id)}
        >
          {locales.transfer}
        </button>
      );
    }
  }
  function VehicleWithdraw(stored: string | null, id: number) {
    if (stored === currentGarage) {
      return (
        <button
          className="block w-full px-6 py-2 my-auto font-semibold text-center text-white transition-all rounded-lg button-bezel button-shadow bg-gradient-to-b from-rhino-500 to-rhino-600 hover:from-rhino-600 hover:to-rhino-700 active:from-rhino-700 active:to-rhino-800 active:scale-95"
          onClick={() => void vehicleAction('withdraw', id)}
        >
          {locales.withdraw}
        </button>
      );
    }
  }

  useEffect(() => {
    setGarageName(config?.Garages?.[currentGarage]?.label ?? 'GARAGE_NAME_NOT_FOUND');
  }, [currentGarage]);

  // Run on component mount
  useEffect(() => {
    if (!isVisible) return;
    getVehicles()
      .then((r) => {
        if (r) {
          setVehicles(r.vehicles);
          setCurrentGarage(r.location);
        }
      })
      .catch(console.error);
  }, [isVisible]);

  return (
    <div
      className={
        (isVisible ? 'fade-in' : 'fade-out') +
        ' opacity-0 w-[800px] border-2 border-rhino-300 bg-rhino-100 text-rhino-950 rounded-xl overflow-hidden max-h-[80vh] grid grid-rows-[auto_1fr] font-semibold'
      }
    >
      <header
        className="relative p-4 text-3xl text-center border-b text-rhino-950 bg-rhino-200 place-items-center border-rhino-300 button-bezel"
        style={{ padding: '1rem 2.25rem' }}
      >
        <div className="relative w-full h-full">
          <p className="block col-start-2 mx-auto my-auto text-center whitespace-nowrap">{garageName}</p>
          <button onClick={close} className="absolute right-0 -translate-y-1/2 top-1/2">
            <svg
              className="w-[0.5em] text-rhino-950 fill-current active:scale-90 transition-transform"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 384 512"
            >
              <path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z" />
            </svg>
          </button>
        </div>
      </header>
      <div
        className="grid content-start p-4 overflow-y-auto "
        style={{
          scrollbarGutter: 'stable both-edges',
        }}
      >
        {vehicles.length === 0 && (
          <div>
            <p className="text-2xl text-center text-rhino-950">No vehicles to withdraw</p>
          </div>
        )}
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="grid grid-cols-[auto_1fr_12rem] border-b border-rhino-300">
            <VehicleImage model={vehicle.model} />
            <div className="flex flex-col justify-center ml-4 text-xl">
              <p className="capitalize ">{vehicle.model}</p>
              <p className="">{vehicle.plate}</p>
            </div>
            {VehicleUnknown(vehicle.stored)}
            {VehicleImpounded(vehicle.stored, vehicle.id)}
            {VehicleTransfer(vehicle.stored, vehicle.id)}
            {VehicleWithdraw(vehicle.stored, vehicle.id)}
          </div>
        ))}
      </div>
    </div>
  );
};
