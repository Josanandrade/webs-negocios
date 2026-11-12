import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveBookingApiBase } from '../lib/avanttai-booking/upstream-safety.ts';

const choose = (configuredUrl, railwayEnvironment='preview', approvedTestOrigin) =>
  resolveBookingApiBase({ configuredUrl, railwayEnvironment, approvedTestOrigin });

const qa = 'https://qa-bookings.example.invalid';
test('preview without explicit approved origin must fail closed',()=> assert.equal(choose(qa), null));
test('preview with exact approved synthetic origin allowed',()=> assert.equal(choose(qa,'preview',qa),qa));
test('different approved origin denied',()=> assert.equal(choose(qa,'preview','https://other.example.invalid'),null));
test('AVANTTAI production custom domain rejected',()=> assert.equal(choose('https://avanttai.com','preview','https://avanttai.com'),null));
test('AVANTTAI production subdomain rejected',()=> assert.equal(choose('https://www.avanttai.com','preview','https://www.avanttai.com'),null));
test('Railway production web service rejected',()=> assert.equal(choose('https://saas-web-production-b554.up.railway.app','preview','https://saas-web-production-b554.up.railway.app'),null));
test('Railway runtime with misleading staging name rejected',()=> assert.equal(choose('https://bot-learning-v2-staging-production.up.railway.app','preview','https://bot-learning-v2-staging-production.up.railway.app'),null));
test('Railway preview-labelled service in production rejected',()=> assert.equal(choose('https://avanttai-health-invoicing-preview-production.up.railway.app','preview','https://avanttai-health-invoicing-preview-production.up.railway.app'),null));
test('HTTP preview origin rejected',()=> assert.equal(choose('http://qa-bookings.example.invalid','preview','http://qa-bookings.example.invalid'),null));
test('URL credentials rejected',()=> assert.equal(choose('https://someone:secret@qa-bookings.example.invalid','preview',qa),null));
test('URL query rejected',()=> assert.equal(choose(qa+'?api=prod','preview',qa),null));
test('URL fragments rejected',()=> assert.equal(choose(qa+'#prod','preview',qa),null));
test('URL path not root rejected',()=> assert.equal(choose(qa+'/api','preview',qa),null));
test('bad approved origin rejected',()=> assert.equal(choose(qa,'preview','not-a-url'),null));
test('production not unexpectedly disabled by preview-only restriction',()=> assert.equal(choose('https://avanttai.com','production'), 'https://avanttai.com'));
test('preview env is case-insensitive',()=> assert.equal(choose(qa,'  PREVIEW  ',qa),qa));
test('trailing slash normalizes',()=> assert.equal(choose(qa+'/','preview',qa),qa));
test('non-http scheme rejected',()=> assert.equal(choose('file:///etc/passwd','preview',qa),null));
