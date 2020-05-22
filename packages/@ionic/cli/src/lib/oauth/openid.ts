import { Response } from 'superagent';

import { ContentTypes, OpenIdToken } from '../../definitions';
import { isOpenIDTokenExchangeResponse } from '../../guards';

import {
  AuthorizationParameters,
  OAuth2Flow,
  OAuth2FlowDeps,
  OAuth2FlowOptions,
  TokenParameters
} from './oauth';

const AUTHORIZATION_URL = 'https://staging.ionicframework.com/oauth/authorize';
const TOKEN_URL = 'https://api-staging.ionicjs.com/oauth/token';
const CLIENT_ID = 'cli';
const API_AUDIENCE = 'https://api.ionicjs.com';

export interface OpenIDFlowOptions extends Partial<OAuth2FlowOptions> {
  readonly audience?: string;
  readonly accessTokenRequestContentType?: ContentTypes;
}

export class OpenIDFlow extends OAuth2Flow<OpenIdToken> {
  readonly flowName = 'open_id';
  readonly audience: string;

  constructor({ audience = API_AUDIENCE, accessTokenRequestContentType = ContentTypes.formUrlencoded, authorizationUrl = AUTHORIZATION_URL, tokenUrl = TOKEN_URL, clientId = CLIENT_ID, ...options }: OpenIDFlowOptions, readonly e: OAuth2FlowDeps) {
    super({ authorizationUrl, tokenUrl, clientId, accessTokenRequestContentType, ...options }, e);
    this.audience = audience;
  }

  protected generateAuthorizationParameters(challenge: string): AuthorizationParameters {
    return {
      audience: this.audience,
      scope: 'openid profile email offline_access',
      response_type: 'code',
      client_id: this.clientId,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      redirect_uri: this.redirectUrl,
      nonce: this.generateVerifier(),
    };
  }

  protected generateTokenParameters(code: string, verifier: string): TokenParameters {
    return {
      grant_type: 'authorization_code',
      client_id: this.clientId,
      code_verifier: verifier,
      code,
      redirect_uri: this.redirectUrl,
    };
  }

  protected generateRefreshTokenParameters(refreshToken: string): TokenParameters {
    return {
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      client_id: this.clientId,
    };
  }

  protected checkValidExchangeTokenRes(res: Response): boolean {
    return isOpenIDTokenExchangeResponse(res);
  }
}