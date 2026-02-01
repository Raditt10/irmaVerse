import prisma from "@/lib/prisma"
import { NextResponse, NextRequest } from "next/server"
import crypto from "crypto"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const { userIds, invitedById } = await req.json()
    const { id: materialId } = await params

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user exists
    const User = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
        
    if (!User) {
      console.log('User not found in database:', session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log('User found:', User.email, User.role);

    if (User.role !== 'instruktur') {
      return NextResponse.json({ error: "Only instructors are allowed to invite users!" }, { status: 403 });
    }

    // Check which users are already invited
    const existingInvites = await prisma.materialInvite.findMany({
      where: {
        materialId,
        invitedUserId: { in: userIds }
      },
      select: { invitedUserId: true }
    });

    const alreadyInvitedIds = existingInvites.map(invite => invite.invitedUserId);
    const newUserIds = userIds.filter((id: string) => !alreadyInvitedIds.includes(id));

    // Invite only new users
    if (newUserIds.length > 0) {
      await prisma.materialInvite.createMany({
        data: newUserIds.map((userId: string) => ({
          materialId,
          invitedUserId: userId,
          invitedById,
          token: crypto.randomUUID(),
          expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }))
      })
    }

    return NextResponse.json({ 
      success: true,
      newInvites: newUserIds.length,
      alreadyInvited: alreadyInvitedIds,
      totalAttempted: userIds.length
    })
  } catch (error) {
    console.error("Error inviting users to material:", error)
    return NextResponse.json(
      { error: "Failed to invite users to material" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user exists
    const User = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
        
    if (!User) {
      console.log('User not found in database:', session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log('User found:', User.email, User.role);

    if (User.role !== 'instruktur' && User.role !== 'admin') {
      return NextResponse.json({ error: "Only instructors and admins are allowed to access this page!" }, { status: 403 });
    }
    const query = req.nextUrl.searchParams.get("q") || ""
    const { id: materialId } = await params

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } }
        ],
        NOT: {
          courseEnrollments: { some: { materialId } }
        }
      },
      take: 10
    })

    return NextResponse.json(users)
  }
  catch (error) {
    console.error("Error searching users for invitation:", error)
    return NextResponse.json(
      { error: "Failed to search users for invitation" },
      { status: 500 }
    )
  }
}