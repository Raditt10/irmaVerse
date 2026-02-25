import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try{
     const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const User = await prisma.user.findUnique({
    where: { id: session.user.id }
    });
        
    if (!User) {
    console.log('User not found in database:', session.user.id);
    return NextResponse.json({ error: "User not found", code: "UNAUTHORIZED" }, { status: 404 });
    }

    const quizEnroll = await prisma.quizEnrollments.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        quizId: true,
        status: true,
        score: true,
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            questionsCount: true,
            coverColor: true,
          }
        }
      },
    });

    const quiz = await prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        questionsCount: true,
        coverColor: true,
      }
    });

    if(!quiz && !quizEnroll) return NextResponse.json({ message: "Quiz not found", code: "NOT_FOUND" }, { status: 404 });

    const results = quizEnroll.map((m) => ({
      rowId: m.id,
      quizId: m.quizId,
      title: m.quiz.title,
      description: m.quiz.description,
      status: m.status,
      score: m.score,
      questionsCount: m.quiz.questionsCount,
      coverColor: m.quiz.coverColor,
    }));

    const notstarted = quiz.map((m) => ({
      quizId: m.id,
      title: m.title,
      description: m.description,
      status: "notStarted",
      score: 0,
      questionsCount: m.questionsCount,
      coverColor: m.coverColor,
    }));
    results.push(...notstarted);

    return NextResponse.json(results);
  }catch(error){
    console.log(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
 
