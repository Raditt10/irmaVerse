import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// DELETE - Delete a conversation and all its messages
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    // Verify user is the instructor of this conversation
    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        instructorId: session.user.id, // Only instructor can delete
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete all messages in the conversation
    await prisma.chatMessage.deleteMany({
      where: { conversationId },
    });

    // Delete the conversation
    await prisma.chatConversation.delete({
      where: { id: conversationId },
    });

    return NextResponse.json(
      { message: "Conversation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
