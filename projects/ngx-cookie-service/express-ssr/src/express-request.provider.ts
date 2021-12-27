import {StaticProvider} from '@angular/core';
import {REQUEST} from '@nguniversal/express-engine/tokens';
import {REQUEST_PROVIDER_TOKEN, RequestProvider} from 'ngx-cookie-service/request-provider';

export const requestProviderFactory = (request: RequestProvider) => {
  return request;
};

export const expressRequestProvider: StaticProvider = {
  provide: REQUEST_PROVIDER_TOKEN,
  useFactory: requestProviderFactory,
  deps: [REQUEST]
};
