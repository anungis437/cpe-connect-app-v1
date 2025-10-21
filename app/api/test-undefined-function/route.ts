// @ts-nocheck
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

// API route to test undefined function error
export function GET() {
  try {
    // This will throw a ReferenceError: myUndefinedFunction is not defined
    myUndefinedFunction();
    
    return NextResponse.json({ 
      success: true, 
      message: "This should not be reached" 
    });
  } catch (error) {
    // Capture the error in Sentry
    Sentry.captureException(error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      message: "myUndefinedFunction() error captured by Sentry" 
    }, { status: 500 });
  }
}

export function POST() {
  // Another way to trigger the error
  myUndefinedFunction();
  
  return NextResponse.json({ 
    message: "This should not be reached either" 
  });
}