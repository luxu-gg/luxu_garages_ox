import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { userConfig } from '../utils/config';

export const VehicleImage = ({ model }: { model: string }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const fallbackUrl: string = useAtomValue(userConfig).CustomVehicleImageSource;

  useEffect(() => {
    const img = new Image();
    img.src = `https://docs.fivem.net/vehicles/${model}.webp`;
    img.onload = () => {
      setImageSrc(img.src);

      img.remove();
    };

    img.onerror = () => {
      img.src = fallbackUrl.replace('%s', model);
      img.onload = () => {
        setImageSrc(img.src);
        img.remove();
      };
      img.onerror = () => {
        setImageSrc(null);
        img.remove();
      };
    };
  }, [model]);

  return (
    <figure className="w-32 overflow-hidden aspect-square rounded-xl">
      {imageSrc === null ? (
        <div className="w-full h-full animate-pulse bg-rhino-300"></div>
      ) : (
        <img src={imageSrc} className="object-contain w-full h-full" alt="" />
      )}
    </figure>
  );
};
