import prisma from '@/lib/prisma';
import { FriendshipStatus } from '@prisma/client';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try{
    const session = await auth();   
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
    
    const { targetId } = await req.json();
    const userId = session.user.id;

    // check if friendship request is exista
    const friendship = await prisma.friendship.findFirst({
      where: {
        requesterId: targetId,
        addresseeId: userId,
        status: "Pending" as FriendshipStatus,
      },
    });

    if (!friendship) {
      return NextResponse.json("Invalid request", { status: 400 });
    }

    const updated = await prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: "Accepted" as FriendshipStatus },
    });

    return Response.json(updated);
  } catch(error){
    return NextResponse.json({ error: "Failed to fetch and accept request"}, { status: 500})
  }
}