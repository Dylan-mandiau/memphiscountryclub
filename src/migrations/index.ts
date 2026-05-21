import * as migration_20260521_205128_initial from './20260521_205128_initial';

export const migrations = [
  {
    up: migration_20260521_205128_initial.up,
    down: migration_20260521_205128_initial.down,
    name: '20260521_205128_initial'
  },
];
