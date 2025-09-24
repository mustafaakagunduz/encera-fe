import { Buffer } from 'node:buffer';
import { NextRequest, NextResponse } from 'next/server';

const stripTrailingSlash = (value: string) => value.replace(/\/$/, '');
const BACKEND_BASE_URL = stripTrailingSlash(process.env.API_PROXY_TARGET || 'http://localhost:8081/api');

const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] as const;

type SupportedMethod = (typeof METHODS)[number];

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

async function proxyRequest(
  request: NextRequest,
  method: SupportedMethod,
  { params }: RouteContext,
): Promise<NextResponse> {
  const resolvedParams = await params;
  const pathSegments = resolvedParams.path ?? [];
  const joinedPath = pathSegments.join('/');
  const targetUrl = `${BACKEND_BASE_URL}${joinedPath ? `/${joinedPath}` : ''}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  let body: BodyInit | undefined;
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const arrayBuffer = await request.arrayBuffer();
    if (arrayBuffer.byteLength > 0) {
      body = Buffer.from(arrayBuffer);
    }
  }

  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
  });

  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  const responseBuffer = await response.arrayBuffer();

  return new NextResponse(responseBuffer.byteLength ? responseBuffer : null, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

const createHandler = (method: SupportedMethod) =>
  async (request: NextRequest, context: RouteContext) => {
    try {
      return await proxyRequest(request, method, context);
    } catch (error) {
      console.error(`Proxy ${method} ${request.nextUrl.pathname} failed`, error);
      return NextResponse.json(
        { error: 'Upstream request failed' },
        { status: 502 },
      );
    }
  };

export const GET = createHandler('GET');
export const POST = createHandler('POST');
export const PUT = createHandler('PUT');
export const DELETE = createHandler('DELETE');
export const PATCH = createHandler('PATCH');
export const OPTIONS = createHandler('OPTIONS');
