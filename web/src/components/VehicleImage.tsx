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
        <div className="w-full h-full animate-pulse ">
        
          <svg  viewBox="-1.5 0 19 19" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-rhino-400"><path d="M.947 9.928a2.027 2.027 0 0 1 1.347-1.891l1.094-2.824a1.307 1.307 0 0 1 1.164-.797h6.896a1.307 1.307 0 0 1 1.164.797l1.095 2.824a2.027 2.027 0 0 1 1.346 1.891v2.85a.476.476 0 0 1-.475.475h-.671v1.477a.476.476 0 0 1-.475.475h-.978a.476.476 0 0 1-.475-.475v-1.477H4.021v1.477a.476.476 0 0 1-.475.475h-.978a.476.476 0 0 1-.475-.475v-1.477h-.671a.476.476 0 0 1-.475-.475zm3.14.006a1.03 1.03 0 1 0-1.03 1.03 1.03 1.03 0 0 0 1.03-1.03zM3.53 7.911h8.938l-.89-2.297a.228.228 0 0 0-.132-.09H4.552a.228.228 0 0 0-.13.09zm10.441 2.023a1.03 1.03 0 1 0-1.029 1.03 1.03 1.03 0 0 0 1.03-1.03z"/></svg>
        </div>
      ) : (
        <img src={imageSrc} className="object-contain w-full h-full" alt="" />
      )}
    </figure>
  );
};
