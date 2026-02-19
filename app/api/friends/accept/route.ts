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
    
    const { rowId, targetId } = await req.json();
    const userId = session.user.id;

    if(userId === targetId) {
      return NextResponse.json({ message: "cannot accept yourself", code: "SELF_ACCEPT" }, { status: 400 });
    }

    // check if friendship request is exists
    const friendship = await prisma.friendship.findFirst({
      where: {
        id: rowId,
        status: {
          in: [FriendshipStatus.Pending, FriendshipStatus.Friend]
        }
      },
    });

    if (!friendship) return NextResponse.json({ message: "Friendship request not found", code: "NOT_FOUND" }, { status: 400 });
    if (friendship.status === FriendshipStatus.Friend) return NextResponse.json({ message: "Already friends", code: "ALREADY_FRIENDS" }, { status: 400 });

    const updated = await prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: FriendshipStatus.Friend },
    });

    return NextResponse.json(updated);
  } catch(error){
    return NextResponse.json({ error: "Failed to fetch and accept request: " + error }, { status: 500})
  }
}