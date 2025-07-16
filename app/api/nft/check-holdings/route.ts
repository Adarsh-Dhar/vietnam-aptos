import { NextRequest, NextResponse } from "next/server";
import { checkProjectHoldings } from "@/lib/oracle";
import { Network } from "@aptos-labs/ts-sdk";

export async function POST(request: NextRequest) {
  try {
    const { projectName, collectionAddress, network = Network.MAINNET } = await request.json();

    if (!projectName || !collectionAddress) {
      return NextResponse.json(
        { error: "Project name and collection address are required" },
        { status: 400 }
      );
    }

    const result = await checkProjectHoldings(projectName, collectionAddress, network);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to check holdings",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectName = searchParams.get("projectName");
  const collectionAddress = searchParams.get("collectionAddress");
  const network = searchParams.get("network") as Network || Network.MAINNET;

  if (!projectName || !collectionAddress) {
    return NextResponse.json(
      { error: "Project name and collection address are required" },
      { status: 400 }
    );
  }

  try {
    const result = await checkProjectHoldings(projectName, collectionAddress, network);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to check holdings",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 