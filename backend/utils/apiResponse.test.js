const { test } = require('node:test');
const assert = require('node:assert');
const { sendSuccess, sendError } = require('./apiResponse');

test('API Response Utils', async (t) => {
  // Mock response object
  const mockRes = () => {
    const res = {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.jsonData = data;
      return res;
    };
    return res;
  };

  await t.test('sendSuccess formats standard response', () => {
    const res = mockRes();
    sendSuccess(res, { foo: 'bar' }, 201);
    
    assert.strictEqual(res.statusCode, 201);
    assert.deepStrictEqual(res.jsonData, {
      success: true,
      data: { foo: 'bar' },
      error: null
    });
  });

  await t.test('sendSuccess defaults to 200', () => {
    const res = mockRes();
    sendSuccess(res, { foo: 'bar' });
    
    assert.strictEqual(res.statusCode, 200);
  });

  await t.test('sendError formats standard error', () => {
    const res = mockRes();
    sendError(res, 'Not found', 404);
    
    assert.strictEqual(res.statusCode, 404);
    assert.deepStrictEqual(res.jsonData, {
      success: false,
      data: null,
      error: 'Not found'
    });
  });

  await t.test('sendError defaults to 500', () => {
    const res = mockRes();
    sendError(res, 'Internal Error');
    
    assert.strictEqual(res.statusCode, 500);
  });
});
