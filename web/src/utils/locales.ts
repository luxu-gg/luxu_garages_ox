import { atom } from 'jotai';
import type { RawLocales } from '@common/locale';
import DEFAULT_LOCALES from '../../../locales/en.json';
export const localesAtom = atom<Record<RawLocales, string>>(DEFAULT_LOCALES);
