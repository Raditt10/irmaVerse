import prisma from "@/lib/prisma";
import { FriendshipStatus, Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(req: NextRequest){
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

    if (userId === targetId) {
      return NextResponse.json({ message: "Cannot reject yourself", code: "SELF_REJECT" }, { status: 400 });
    }

    // check if friendship request is exists
    const friendship = await prisma.friendship.findFirst({
      where: {
        id: rowId,
        status: FriendshipStatus.Pending,
      },
    });
    if (!friendship) return NextResponse.json({ message: "No existing request from this user", code: "NOT_FOUND"}, { status: 400 });
    
    const reject = await prisma.friendship.delete({
      where: { 
        id: friendship.id,
      },
    });

    const cachekey = `friends:${targetId}`;
    await redis.del(cachekey);
    return NextResponse.json({ message: "Friend request rejected successfully" }, { status: 200 });
  } catch(error){
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Friendship not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Duplicate request", code: "DUPLICATE" },
        { status: 400 }
      );
    }
  };
    return NextResponse.json({ error: "Failed to reject friendship" }, { status: 500 });
  }
}