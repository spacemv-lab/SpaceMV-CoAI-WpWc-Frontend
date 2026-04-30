/**
 * Copyright (c) 2018 RuoYi
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
 **/
import autoImport from 'unplugin-auto-import/vite';

export default function createAutoImport() {
  return autoImport({
    imports: ['vue', 'vue-router', 'pinia'],
    dts: false,
  });
}
