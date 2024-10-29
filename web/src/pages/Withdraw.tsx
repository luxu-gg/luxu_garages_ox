import { useEffect, useState } from 'react';
import { fetchNui } from '../utils/fetchNui';
import type { OwnedVehicle } from '@common/types';
import { isEnvBrowser } from '../utils/misc';
import { mockupVehicles } from '../utils/mockups';
import { VehicleImage } from '../components/VehicleImage';

async function getVehicles() {
  return await fetchNui<{ vehicles: OwnedVehicle[]; location: string }>('getVehiclesAndLocation');
}

export const Withdraw = (props: { close: () => void }) => {
  const { close } = props;
  const [vehicles, setVehicles] = useState<OwnedVehicle[]>(isEnvBrowser() ? mockupVehicles : []);
  const [currentGarage, setCurrentGarage] = useState<string>('');

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
          onClick={() => vehicleAction('recover', id)}
        >
          Recover
        </button>
      );
    }
  }
  function VehicleTransfer(stored: string | null, id: number) {
    if (stored && stored !== 'impound' && stored !== currentGarage) {
      return (
        <button
          className="block w-full px-6 py-2 my-auto font-semibold text-center text-white transition-all rounded-lg button-bezel button-shadow bg-gradient-to-b from-affair-500 to-affair-600 hover:from-affair-600 hover:to-affair-700 active:from-affair-700 active:to-affair-800 active:scale-95"
          onClick={() => vehicleAction('transfer', id)}
        >
          Transfer
        </button>
      );
    }
  }
  function VehicleWithdraw(stored: string | null, id: number) {
    if (stored === currentGarage) {
      return (
        <button
          className="block w-full px-6 py-2 my-auto font-semibold text-center text-white transition-all rounded-lg button-bezel button-shadow bg-gradient-to-b from-rhino-500 to-rhino-600 hover:from-rhino-600 hover:to-rhino-700 active:from-rhino-700 active:to-rhino-800 active:scale-95"
          onClick={() => vehicleAction('withdraw', id)}
        >
          Withdraw
        </button>
      );
    }
  }

  // Run on component mount
  useEffect(() => {
    getVehicles()
      .then((r) => {
        if (r) {
          setVehicles(r.vehicles);
          setCurrentGarage(r.location);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="w-[800px] outline outline-4 outline-rhino-300 shadow-sm bg-rhino-100 text-rhino-950 rounded-xl overflow-hidden max-h-[80vh] grid grid-rows-[auto_1fr] font-semibold">
      <div
        className="grid grid-cols-3 p-4 text-3xl text-center text-rhino-950 bg-rhino-200 place-items-center"
        style={{ padding: '1rem 2.25rem' }}
      >
        <p className="col-start-2">Withdraw</p>
        <button onClick={close} className="col-start-3 ml-auto">
          <svg
            className="w-[0.5em] text-rhino-950 fill-current active:scale-90 transition-transform"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 384 512"
          >
            <path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z" />
          </svg>
        </button>
      </div>
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
          <div key={vehicle.id} className="grid grid-cols-[auto_1fr_12rem]">
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
