import { AxiosError, AxiosHeaders } from 'axios';

import { isApiError, toApiError } from '@/utils/errors';

function axiosErrorWith(status: number | null, data: unknown, code?: string): AxiosError {
  const err = new AxiosError('failed', code);
  if (status !== null) {
    err.response = {
      status,
      data,
      statusText: '',
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
  }
  return err;
}

describe('toApiError', () => {
  test('maps a validation body to the first violation message', () => {
    const e = axiosErrorWith(400, {
      title: 'Constraint Violation',
      status: 400,
      violations: [{ field: 'x.email', message: 'must be a well-formed email address' }],
    });
    const api = toApiError(e);
    expect(api.status).toBe(400);
    expect(api.message).toBe('must be a well-formed email address');
    expect(api.violations).toHaveLength(1);
  });

  test('maps a plain-text body', () => {
    const api = toApiError(axiosErrorWith(404, 'User not found'));
    expect(api.status).toBe(404);
    expect(api.message).toBe('User not found');
  });

  test('flags network errors (no response)', () => {
    const api = toApiError(axiosErrorWith(null, undefined));
    expect(api.status).toBe(0);
    expect(api.isNetworkError).toBe(true);
  });

  test('flags timeouts', () => {
    const api = toApiError(axiosErrorWith(null, undefined, 'ECONNABORTED'));
    expect(api.isNetworkError).toBe(true);
    expect(api.message).toMatch(/timed out/i);
  });

  test('isApiError type guard', () => {
    expect(isApiError(toApiError(axiosErrorWith(500, '')))).toBe(true);
    expect(isApiError(new Error('x'))).toBe(false);
  });
});
