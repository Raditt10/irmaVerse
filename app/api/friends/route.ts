import prisma from "@/lib/prisma";
import { FriendshipStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {       // Request
  try{
    const session = await auth();    
    if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }
    const User = await prisma.user.findUnique({
    where: { id: session.user.id }
    });
        
    if (!User) {
    console.log('User not found in database:', session.user.id);
    return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { targetId } = await req.json();
    const userId = session.user.id;

    if (userId === targetId) {
      return NextResponse.json({ message: "Cannot friend yourself", code: "SELF_REQUEST" }, { status: 400 });
    }

    // Check existing relationship
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: targetId },
          { requesterId: targetId, addresseeId: userId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Relationship already exists", code: "ALREADY_EXISTS" }, { status: 400 });
    }

    const friendship = await prisma.friendship.create({
      data: {
        requesterId: userId,
        addresseeId: targetId,
        status: "Pending" as FriendshipStatus,
      },
    });

    return NextResponse.json({ success: true, message: "Berhasil mengirim request pertemanan" }, { status: 201 });
  } catch(error){
    return NextResponse.json({ message: "gagal mengirim request pertemanan" }, { status: 500 })
  }
}

export async function GET(req: NextRequest){         // Fetch
  try{
    const session = await auth();    
    if (!session || !session.user) {
      return NextResponse.json({ mesage: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }
    const User = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
        
    if (!User) {
      console.log('User not found in database:', session.user.id);
      return NextResponse.json({ message: "User not found", code: "UNAUTHRORIZED" }, { status: 401 });
    };

    const friends = await prisma.user.findMany({
      where: {
        status: "Accepted",
        OR: [
          { requesterId: User.id },
          { addresseeId: User.id },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            role: true,
            class: true,
            avatar: true,
          },
        },
        addressee: {
          select: {
            id: true,
            name: true,
            role: true,
            class: true,
            avatar: true,
          },
        },
      },
    });

    if(friends.length < 1) return NextResponse.json({ message: "No data found", code: "NOT_FOUND" }, { status: 404 });

    const friendsData = friends.map((f) =>
      f.requesterId === User.id ? f.addressee : f.requester
    );


    return NextResponse.json(friendsData);
  }catch(error){
    return NextResponse.json({ message: "Failed to fetch friend requests" }, { status: 500 })
  }
}