import {InjectionToken} from '@angular/core';

export interface RequestProvider {
  headers? : {
    cookie: string;
  }
}

export const REQUEST_PROVIDER_TOKEN = new InjectionToken<RequestProvider>('request provider token')
