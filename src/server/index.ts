import { GetPlayer, CreateVehicle, GetVehicle, type OxVehicle, SpawnVehicle } from '@overextended/ox_core/server';
import { addCommand, cache, onClientCallback } from '@overextended/ox_lib/server';
import { oxmysql } from '@overextended/oxmysql';
import type { OwnedVehicle } from '@common/types';
import userConfig from '@common/config';

onClientCallback(`${cache.resource}:getVehicles`, async (source): Promise<OwnedVehicle[]> => {
  const player = GetPlayer(source);
  if (!player) return [];

  const charId = player.charId;
  const values = [charId];

  const query = 'SELECT id,plate,owner,model,stored FROM vehicles WHERE owner = ?';
  const vehicles = await oxmysql.rawExecute<OwnedVehicle[]>(query, values);
  return vehicles;
});

onClientCallback(`${cache.resource}:storeCurrentVehicle`, async (source: number) => {
  const player = GetPlayer(source);
  if (!player) return false;
  const vehicleNetId = GetVehiclePedIsIn(player.ped, false);
  if (vehicleNetId === 0) return false;
  const vehicle = GetVehicle(vehicleNetId);
  if (!vehicle || !vehicle.id) return false;
  const garageId = (Player(source).state.currentGarage as string) || null;
  vehicle.setStored(garageId, true);
  return true;
});

onClientCallback(`${cache.resource}:withdraw`, async (source, id: number) => {
  const player = GetPlayer(source);
  if (!player) return false;
  const ped = player.ped;
  const playerCurrentGarage = Player(source).state.currentGarage as keyof typeof userConfig.Garages;
  const isStored = await oxmysql.prepare<1>('SELECT 1 FROM vehicles WHERE id = ? AND stored = ? AND owner= ?', [
    id,
    playerCurrentGarage,
    player.charId,
  ]);
  if (!isStored) return false;

  const garage = userConfig.Garages[playerCurrentGarage];
  if (!garage) return false;
  const vehicle = await SpawnVehicle(id, garage.spawn, garage.spawn[3]);
  if (!vehicle) return false;
  // vehicle.setStored(null, false);
  await delay(500);
  TaskWarpPedIntoVehicle(ped, vehicle.entity, -1);
  return true;
});
onClientCallback(`${cache.resource}:transfer`, async (source, id: number) => {
  const player = GetPlayer(source);
  const currentGarage = (Player(source).state.currentGarage || '') as keyof typeof userConfig.Garages;
  if (!player) return false;

  const account = await player.getAccount();
  const balance = await account.get('balance');
  const transferFee = userConfig.Prices.transfer;

  if (balance < transferFee) {
    return false;
  }

  const success = await oxmysql.update('UPDATE vehicles SET stored = ? WHERE id = ? AND owner = ?', [
    currentGarage,
    id,
    player.charId,
  ]);

  if (success === 1) {
    await account.removeBalance({ amount: transferFee, message: 'Vehicle transfer fee', overdraw: false });
  }

  return success === 1;
});
onClientCallback(`${cache.resource}:recover`, async (source, id: number) => {
  const player = GetPlayer(source);
  const currentGarage = (Player(source).state.currentGarage || '') as keyof typeof userConfig.Garages;
  const garage = userConfig.Garages[currentGarage];
  if (!player || !garage) return false;
  const account = await player.getAccount();
  const balance = await account.get('balance');
  const impoundTransferFee = userConfig.Prices.transfer_from_impound;
  if (balance < impoundTransferFee) {
    return false;
  }
  await account.removeBalance({ amount: impoundTransferFee, message: 'Transfer from impound', overdraw: false });

  return true;
});

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

if (userConfig?.Commands?.givecar?.enabled) {
  addCommand<{ model: string }>(
    userConfig.Commands.givecar.name,
    async (source: number, args) => {
      const player = GetPlayer(source);
      const ped = GetPlayerPed(`${source}`);
      if (!player) return;
      const coords = player.getCoords();
      const vehicle = await CreateVehicle(
        {
          model: args.model,
          owner: player.charId,
        },
        coords
      );
      if (!vehicle) return;
      await delay(500);
      setImmediate(() => {
        TaskWarpPedIntoVehicle(ped, vehicle.entity, -1);
      });
    },
    {
      params: [{ name: 'model', optional: false, help: userConfig.Commands.givecar.help.model, paramType: 'string' }],
      restricted: true,
      name: userConfig.Commands.givecar.name,
    }
  );
}
