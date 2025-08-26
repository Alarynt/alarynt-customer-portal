#!/usr/bin/env node

/**
 * Simple test script to verify Swagger documentation is working
 * Run with: node test-swagger.js
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, description) {
  return new Promise((resolve) => {
    const req = http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'],
          data: data,
          description
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        status: 'ERROR',
        error: err.message,
        description
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        description
      });
    });
  });
}

async function testSwaggerEndpoints() {
  console.log('🔍 Testing Swagger Documentation Endpoints...\n');
  
  const tests = [
    { path: '/health', desc: 'Basic Health Check' },
    { path: '/api-docs.json', desc: 'OpenAPI JSON Specification' },
    { path: '/api-docs', desc: 'Swagger UI (HTML)' }
  ];
  
  let allPassed = true;
  
  for (const test of tests) {
    console.log(`Testing: ${test.desc}`);
    console.log(`URL: ${BASE_URL}${test.path}`);
    
    const result = await makeRequest(test.path, test.desc);
    
    if (result.status === 'ERROR') {
      console.log(`❌ FAILED: ${result.error}\n`);
      allPassed = false;
      continue;
    }
    
    if (result.status === 'TIMEOUT') {
      console.log(`⏰ TIMEOUT: Request took too long\n`);
      allPassed = false;
      continue;
    }
    
    console.log(`Status: ${result.status}`);
    console.log(`Content-Type: ${result.contentType}`);
    
    // Basic validation
    if (test.path === '/health') {
      if (result.status === 200 && result.contentType?.includes('application/json')) {
        try {
          const parsed = JSON.parse(result.data);
          if (parsed.status === 'healthy') {
            console.log('✅ PASSED: Health check returned healthy status');
          } else {
            console.log(`❌ FAILED: Unexpected health status: ${parsed.status}`);
            allPassed = false;
          }
        } catch (e) {
          console.log(`❌ FAILED: Invalid JSON response`);
          allPassed = false;
        }
      } else {
        console.log(`❌ FAILED: Expected 200 + JSON, got ${result.status} + ${result.contentType}`);
        allPassed = false;
      }
    } else if (test.path === '/api-docs.json') {
      if (result.status === 200 && result.contentType?.includes('application/json')) {
        try {
          const parsed = JSON.parse(result.data);
          if (parsed.openapi && parsed.info && parsed.paths) {
            console.log(`✅ PASSED: Valid OpenAPI spec (${Object.keys(parsed.paths).length} paths)`);
          } else {
            console.log(`❌ FAILED: Invalid OpenAPI structure`);
            allPassed = false;
          }
        } catch (e) {
          console.log(`❌ FAILED: Invalid JSON in OpenAPI spec`);
          allPassed = false;
        }
      } else {
        console.log(`❌ FAILED: Expected 200 + JSON, got ${result.status} + ${result.contentType}`);
        allPassed = false;
      }
    } else if (test.path === '/api-docs') {
      if (result.status === 200 && result.contentType?.includes('text/html')) {
        if (result.data.includes('swagger-ui') || result.data.includes('Swagger UI')) {
          console.log('✅ PASSED: Swagger UI HTML page loaded');
        } else {
          console.log(`❌ FAILED: HTML doesn't appear to be Swagger UI`);
          allPassed = false;
        }
      } else {
        console.log(`❌ FAILED: Expected 200 + HTML, got ${result.status} + ${result.contentType}`);
        allPassed = false;
      }
    }
    
    console.log('');
  }
  
  console.log('='.repeat(50));
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log(`\n📖 Access your API documentation at: ${BASE_URL}/api-docs`);
    console.log(`📄 OpenAPI spec available at: ${BASE_URL}/api-docs.json`);
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('\nMake sure the server is running with: npm run dev');
  }
  console.log('='.repeat(50));
}

// Check if server is likely running first
makeRequest('/health', 'Server Check').then((result) => {
  if (result.status === 'ERROR' && result.error.includes('ECONNREFUSED')) {
    console.log('❌ Server not running!');
    console.log('\nTo start the server:');
    console.log('  npm run dev');
    console.log('\nThen run this test again:');
    console.log('  node test-swagger.js');
    return;
  }
  
  testSwaggerEndpoints();
});