
export {}
import type {Config} from '@jest/types';
import { defaults } from 'jest-config';

console.log(defaults);

export default async (): Promise<Config.InitialOptions> => {
    return {
      verbose: true,
    };
};
