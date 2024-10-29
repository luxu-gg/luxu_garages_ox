import type StaticConfig from '~/static/config.json';
import { LoadJsonFile } from 'utils';

export type Config = typeof StaticConfig;
export default LoadJsonFile<typeof StaticConfig>('static/config.json');
