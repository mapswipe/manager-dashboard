import {
    describe,
    expect,
    it,
} from 'vitest';

import { domainUrlCondition } from './common';

describe('domainUrlCondition', () => {
    it.each([
        'https://panoramax.example.com',
        'https://panoramax.example.com/',
        'http://localhost:8080',
        'https://panoramax.example.com:8443/',
        'http://192.168.1.2',
    ])('accepts %j', (url) => {
        expect(domainUrlCondition(url)).toBeUndefined();
    });

    it.each([
        [' https://p.org', 'Url must not have leading or trailing whitespace.'],
        ['https://p.org ', 'Url must not have leading or trailing whitespace.'],
        ['\thttps://p.org', 'Url must not have leading or trailing whitespace.'],
        ['https://p.org\n', 'Url must not have leading or trailing whitespace.'],
        ['p.org', 'Url must start with http:// or https://.'],
        ['ftp://p.org', 'Url must start with http:// or https://.'],
        ['https://p.org/?', 'Url must not have a path, query or fragment.'],
        ['https://p.org#', 'Url must not have a path, query or fragment.'],
        ['https://p.org/?a=1', 'Url must not have a path, query or fragment.'],
        ['https://p.org/#a', 'Url must not have a path, query or fragment.'],
        ['https://p.org/a', 'Url must not have a path, query or fragment.'],
        ['https://p.org/a/..', 'Url must not have a path, query or fragment.'],
        ['https://p.org/api', 'Url must not have a path, query or fragment.'],
        ['https://p.org//', 'Url must not have a path, query or fragment.'],
        ['https://u:secret@p.org', 'Url must not have credentials.'],
        ['https://p..org', 'Url must have a valid hostname or IPv4 address and an optional port.'],
        ['https://256.1.1.1', 'Url must have a valid hostname or IPv4 address and an optional port.'],
        ['https://p.org:0', 'Url must have a valid hostname or IPv4 address and an optional port.'],
        ['https://p.org:65536', 'Url must have a valid hostname or IPv4 address and an optional port.'],
        ['https://[::1]', 'Url must have a valid hostname or IPv4 address and an optional port.'],
    ])('rejects %j', (url, message) => {
        expect(domainUrlCondition(url)).toBe(message);
    });
});
