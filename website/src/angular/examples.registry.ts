import type { Type } from '@angular/core';

/** Lazy loaders for every example under `website/src/examples`, keyed by folder name. */
export const EXAMPLES: Record<string, () => Promise<Type<unknown>>> = {
  'quick-start-example': () => import('@examples/quick-start-example/quick-start-example.component').then((m) => m.QuickStartExampleComponent),
  'read-write-example': () => import('@examples/read-write-example/read-write-example.component').then((m) => m.ReadWriteExampleComponent),
  'expires-example': () => import('@examples/expires-example/expires-example.component').then((m) => m.ExpiresExampleComponent),
  'path-example': () => import('@examples/path-example/path-example.component').then((m) => m.PathExampleComponent),
  'same-site-example': () => import('@examples/same-site-example/same-site-example.component').then((m) => m.SameSiteExampleComponent),
  'delete-example': () => import('@examples/delete-example/delete-example.component').then((m) => m.DeleteExampleComponent),
  'encoding-example': () => import('@examples/encoding-example/encoding-example.component').then((m) => m.EncodingExampleComponent),
  'custom-codec-example': () => import('@examples/custom-codec-example/custom-codec-example.component').then((m) => m.CustomCodecExampleComponent),
  'default-options-example': () => import('@examples/default-options-example/default-options-example.component').then((m) => m.DefaultOptionsExampleComponent),
};
