import assert from 'node:assert/strict';
import { isActivePath, mapHref, normalizePath, parseMapCoords } from './nav.ts';

assert.equal(normalizePath('/map/'), '/map');
assert.equal(normalizePath('/'), '/');
assert.equal(isActivePath('/map', '/map'), true);
assert.equal(isActivePath('/map/', '/map'), true);
assert.equal(isActivePath('/analytics', '/map'), false);
assert.equal(isActivePath('/', '/'), true);
assert.equal(isActivePath('/about', '/'), false);
assert.equal(mapHref(19.2183, 72.9781), '/map?lat=19.2183&lon=72.9781');
assert.deepEqual(parseMapCoords('19.2', '72.9'), { lat: 19.2, lon: 72.9 });
assert.equal(parseMapCoords('0', '0')?.lat, 0);
assert.equal(parseMapCoords('', '72'), null);
assert.equal(parseMapCoords('abc', '72'), null);
assert.equal(parseMapCoords('91', '72'), null);
assert.equal(parseMapCoords(null, '72'), null);

console.log('nav helpers ok');
