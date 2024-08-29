import { NextResponse } from 'next/server';

export async function GET() {
  const jsonRpcNodeProvider = process.env.ENDPOINT_RPC;
  const bundlerUrl = process.env.BUNDLE_URL;
  const paymasterRPC = process.env.PAYMASTER_RPC;

  return NextResponse.json({
    jsonRpcNodeProvider,
    bundlerUrl,
    paymasterRPC
  }, { status: 200 });
}