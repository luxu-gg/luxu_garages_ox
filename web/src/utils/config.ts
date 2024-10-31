import { atom } from 'jotai';
import DEFAULT_CONFIG from '../../../static/config.json';
import type { Config } from '@common/config';

export const userConfig = atom<Config>(DEFAULT_CONFIG);
