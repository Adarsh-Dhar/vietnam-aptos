import { NextRequest, NextResponse } from "next/server";
import { getSimpleHolderCount, getHolderCountByAccount, getAccountTokens } from "@/lib/oracle";
import { Network } from "@aptos-labs/ts-sdk";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accountAddress = searchParams.get("account");
  const collectionAddress = searchParams.get("collection");
  const network = searchParams.get("network") as Network || Network.MAINNET;
  const type = searchParams.get("type") || "simple";

  if (!accountAddress) {
    return NextResponse.json(
      { error: "Account address is required" },
      { status: 400 }
    );
  }

  try {
    let result;

    switch (type) {
      case "simple":
        if (!collectionAddress) {
          return NextResponse.json(
            { error: "Collection address is required for simple holder count" },
            { status: 400 }
          );
        }
        const holderCount = await getSimpleHolderCount(accountAddress, collectionAddress, network);
        result = { holderCount };
        break;

      case "detailed":
        if (!collectionAddress) {
          return NextResponse.json(
            { error: "Collection address is required for detailed analysis" },
            { status: 400 }
          );
        }
        result = await getHolderCountByAccount(accountAddress, collectionAddress, network);
        break;

      case "tokens":
        const tokens = await getAccountTokens(accountAddress, network);
        result = { tokens, count: tokens.length };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid type parameter. Use 'simple', 'detailed', or 'tokens'" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch holder data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountAddress, collectionAddress, network = Network.MAINNET, type = "simple" } = body;

    if (!accountAddress) {
      return NextResponse.json(
        { error: "Account address is required" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "simple":
        if (!collectionAddress) {
          return NextResponse.json(
            { error: "Collection address is required for simple holder count" },
            { status: 400 }
          );
        }
        const holderCount = await getSimpleHolderCount(accountAddress, collectionAddress, network);
        result = { holderCount };
        break;

      case "detailed":
        if (!collectionAddress) {
          return NextResponse.json(
            { error: "Collection address is required for detailed analysis" },
            { status: 400 }
          );
        }
        result = await getHolderCountByAccount(accountAddress, collectionAddress, network);
        break;

      case "tokens":
        const tokens = await getAccountTokens(accountAddress, network);
        result = { tokens, count: tokens.length };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid type parameter. Use 'simple', 'detailed', or 'tokens'" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch holder data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 