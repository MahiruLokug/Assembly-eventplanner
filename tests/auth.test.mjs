import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from 'jose';
import { verifyOrganiserToken } from '../lib/access.ts';

const config = {
  ACCESS_TEAM_DOMAIN: 'https://assembly-test.cloudflareaccess.com',
  ACCESS_AUD: 'assembly-test-audience',
  ADMIN_EMAILS: 'organiser@example.com',
};
const { privateKey, publicKey } = await generateKeyPair('RS256');
const jwk = await exportJWK(publicKey);
const keys = createLocalJWKSet({ keys: [{ ...jwk, kid: 'test', alg: 'RS256' }] });
async function token(overrides = {}, signingKey = privateKey) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    iss: config.ACCESS_TEAM_DOMAIN, aud: config.ACCESS_AUD,
    sub: 'test-user', email: 'organiser@example.com', iat: now, exp: now + 300,
    ...overrides,
  }).setProtectedHeader({ alg: 'RS256', kid: 'test' }).sign(signingKey);
}
test('accepts a valid signed organiser identity', async () => {
  assert.deepEqual(await verifyOrganiserToken(await token(), config, keys), { email: 'organiser@example.com' });
});
test('rejects missing configuration and unsigned input', async () => {
  assert.equal(await verifyOrganiserToken(null, config, keys), null);
  assert.equal(await verifyOrganiserToken('invented', config, keys), null);
  assert.equal(await verifyOrganiserToken(await token(), {}, keys), null);
});
test('rejects expired tokens, wrong issuer/audience, missing claims and unapproved email', async () => {
  for (const change of [
    { exp: 1 }, { exp: undefined }, { sub: undefined }, { iat: undefined },
    { iss: 'https://other.cloudflareaccess.com' }, { aud: 'other-application' },
    { email: 'visitor@example.com' }, { email: undefined },
  ]) assert.equal(await verifyOrganiserToken(await token(change), config, keys), null);
});
test('rejects a token signed by an unrelated key', async () => {
  const other = await generateKeyPair('RS256');
  assert.equal(await verifyOrganiserToken(await token({}, other.privateKey), config, keys), null);
});
