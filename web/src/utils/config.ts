import { atom } from 'jotai';
import DEFAULT_CONFIG from '../../../static/config.json';

export const userConfig = atom(DEFAULT_CONFIG);
