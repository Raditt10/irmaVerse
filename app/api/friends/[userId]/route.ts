import prisma from "@/lib/prisma";
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
  try{
    const session = await auth();
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');  
    if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const User = await prisma.user.findUnique({
    where: { id: session.user.id }
    });
        
    if (!User) {
    console.log('User not found in database:', session.user.id);
    return NextResponse.json({ error: "User not found" }, { status: 404 });
    }


  }catch(error){
    return NextResponse.json({ error: "Failed to fetch mutual friends" }, { status: 500 })
  }
}