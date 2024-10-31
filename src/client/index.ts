import userConfig from '@common/config';
import { cache, hideTextUI, notify, Point, showTextUI, triggerServerCallback } from '@overextended/ox_lib/client';
import Locale from '@common/locale';
import type { OwnedVehicle } from '@common/types';
import { LoadFile, LoadJsonFile } from 'utils';

function openGarage(menu: string) {
  SendNUIMessage({
    action: 'setMenu',
    data: { menu },
  });
  SetNuiFocus(true, true);
}

async function storeVehicle() {
  const result = await triggerServerCallback<boolean>(`${cache.resource}:storeCurrentVehicle`, null);
  if (result) {
    notify({
      duration: 4000,
      type: 'success',
      title: Locale('vehicle_stored'),
    });
  } else {
    notify({
      duration: 4000,
      type: 'error',
      title: Locale('cannot_store_this_vehicle'),
    });
  }
}

RegisterNuiCallback('exit', (data: null, cb: (data: unknown) => void) => {
  SetNuiFocus(false, false);
  cb({});
});

RegisterNuiCallback(
  'getVehiclesAndLocation',
  async (_, cb: (data: { vehicles: OwnedVehicle[]; location: string }) => void) => {
    const vehicles = (await triggerServerCallback<OwnedVehicle[]>(`${cache.resource}:getVehicles`, null)) || [];
    const location: string = (LocalPlayer.state.currentGarage as string) || '';
    cb({ vehicles, location });
  }
);

RegisterNuiCallback('withdraw', async (id: number, cb: (result: boolean) => void) => {
  const result = (await triggerServerCallback<boolean>(`${cache.resource}:withdraw`, null, id)) as boolean;
  cb(result);
});

// Recover from impound
RegisterNuiCallback('recover', async (id: number, cb: (result: boolean) => void) => {
  const result = (await triggerServerCallback<boolean>(`${cache.resource}:recover`, null, id)) as boolean;
  if (result) {
    notify({
      duration: 4000,
      type: 'success',
      title: Locale('vehicle_recovered'),
    });
  } else {
    notify({
      duration: 4000,
      type: 'error',
      title: Locale('not_enough_money'),
    });
  }
  cb(result);
});
RegisterNuiCallback('transfer', async (id: number, cb: (result: boolean) => void) => {
  const result = (await triggerServerCallback<boolean>(`${cache.resource}:transfer`, null, id)) as boolean;
  if (result) {
    notify({
      duration: 4000,
      type: 'success',
      title: Locale('vehicle_transferred'),
    });
  } else {
    notify({
      duration: 4000,
      type: 'error',
      title: Locale('not_enough_money'),
    });
  }
  cb(result);
});

setImmediate(() => {
  const locales = LoadJsonFile(`locales/${GetConvar('ox:locale', 'en')}.json`);
  SendNUIMessage({
    action: 'getConfigAndLocales',
    data: { config: userConfig, locales: locales },
  });

  Object.values(userConfig.Garages).forEach((g) => {
    if (g.blip.enabled) {
      const blip = AddBlipForCoord(g.withdraw[0], g.withdraw[1], g.withdraw[2]);
      SetBlipSprite(blip, g.blip.sprite);
      SetBlipColour(blip, g.blip.color);
    }

    function enterWithdraw(this: Point) {
      DrawMarker(
        2,
        g.withdraw[0],
        g.withdraw[1],
        g.withdraw[2],
        0,
        0,
        0,
        0,
        180,
        0,
        1,
        1,
        1,
        200,
        20,
        20,
        50,
        false,
        true,
        2,
        false,
        null,
        null,
        false
      );
      if (this.currentDistance && this.currentDistance < 2 && IsControlJustReleased(0, 38)) {
        openGarage('withdraw');
      }
    }

    new Point({
      coords: [g.withdraw[0], g.withdraw[1], g.withdraw[2]],
      distance: 5,
      onEnter: () => {
        if (GetVehiclePedIsIn(cache.ped, false) > 0) return;
        showTextUI('Press E to open garage');
        LocalPlayer.state.set('currentGarage', g.id, true);
      },
      onExit: () => {
        hideTextUI();
        LocalPlayer.state.set('currentGarage', null, true);
      },
      nearby: enterWithdraw,
    });

    function depositWithdraw(this: Point) {
      if (GetVehiclePedIsIn(cache.ped, false) == 0) return;
      DrawMarker(
        2,
        g.deposit[0],
        g.deposit[1],
        g.deposit[2],
        0,
        0,
        0,
        0,
        180,
        0,
        1,
        1,
        1,
        200,
        20,
        20,
        50,
        false,
        true,
        2,
        false,
        null,
        null,
        false
      );
      if (this.currentDistance && this.currentDistance < 4 && IsControlJustReleased(0, 38)) {
        void storeVehicle();
      }
    }

    new Point({
      coords: [g.deposit[0], g.deposit[1], g.deposit[2]],
      distance: 6,
      onEnter: () => {
        if (GetVehiclePedIsIn(cache.ped, false) == 0) return;
        showTextUI('Press E to save vehicle');
        LocalPlayer.state.set('currentGarage', g.id, true);
      },
      onExit: () => {
        hideTextUI();
        LocalPlayer.state.set('currentGarage', null, true);
      },
      nearby: depositWithdraw,
    });
  });
});
