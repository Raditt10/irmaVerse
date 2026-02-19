import prisma from "@/lib/prisma";
import { FriendshipStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

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
      select: {
        status: true,
      },
    });

    switch (existing?.status) {
      case "Friend":
        return NextResponse.json({ message: "Already friends", code: "ALREADY_FRIENDS" }, { status: 403 });
      case "Pending":
          return NextResponse.json({ message: "Friend request already sent", code: "ALREADY_SENT" }, { status: 400 });
      case "Blocked":
        return NextResponse.json({ message: "Cannot send request to a blocked user", code: "USER_BLOCKED" }, { status: 403 });
    }

    const friendship = await prisma.friendship.create({
      data: {
        requesterId: userId,
        addresseeId: targetId,
        status: FriendshipStatus.Pending
      },
    });
    if(!friendship) return NextResponse.json({ message: "QUERY FAILED" }, { status: 500})

    return NextResponse.json({ message: "Berhasil mengirim request pertemanan" }, { status: 201 });
  } catch(error){
    return NextResponse.json({ message: "gagal mengirim request pertemanan" }, { status: 500 })
  }
}

export async function GET(req: NextRequest){         // Fetch
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
      return NextResponse.json({ message: "User not found", code: "UNAUTHORIZED" }, { status: 401 });
    };

    const cacheKey = `friends:${User.id}`;   //check if already cached
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache HIT for friends of user:", User.id);
      return NextResponse.json(JSON.parse(cached));
    }

    console.log("Cache MISS for friends of user:", User.id);
    const friends = await prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.Friend,
        OR: [
          { requesterId: User.id },
          { addresseeId: User.id },
        ]
      },
      select: {
        id: true,
        status: true, // ambil status
        requesterId: true,
        addresseeId: true,

        requester: {
          select: {
            id: true,
            name: true,
            role: true,
            class: true,
            avatar: true,
            points: true,
          },
        },
        addressee: {
          select: {
            id: true,
            name: true,
            role: true,
            class: true,
            avatar: true,
            points: true,
          },
        },
      },
    });

    const pendingFriends = await prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.Pending,
        addresseeId: User.id,
      },
      select: {
        id: true,
        status: true,
        requester: {
          select: {
            id: true,
            name: true,
            role: true,
            class: true,
            avatar: true,
            points: true,
          },
        },
      },
    });

    if(friends.length <= 1 && pendingFriends.length <= 0) return NextResponse.json({ message: "No friends found", code: "NO_FRIENDS" }, { status: 404 });

    const results = friends.map((m) => {
      const otherUser =
      m.requesterId === User.id ? m.addressee : m.requester;

      return {
        rowId: m.id,
        id: otherUser.id,
        name: otherUser.name,
        role: otherUser.role,
        class: otherUser.class,
        avatar: otherUser.avatar,
        points: otherUser.points,
        status: m.status,
      }
    });
    const pending = pendingFriends.map((p) => ({
      rowId: p.id,
      id: p.requester.id,
      name: p.requester.name,
      role: p.requester.role,
      class: p.requester.class,
      avatar: p.requester.avatar,
      points: p.requester.points,
      status: p.status,
    }));
    results.push(...pending);
    
    await redis.set(cacheKey, JSON.stringify(results), "EX", 90);
    return NextResponse.json(results);
  }catch(error){
    return NextResponse.json({ message: "Failed to fetch friend requests" + error }, { status: 500 })
  }
}