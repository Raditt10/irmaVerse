import prisma from "@/lib/prisma";
import { QuizStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }){
  try {
    const session = await auth();
    const { slug } = await params;
    if(!session || !session.user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });

    const User = await prisma.user.findUnique({
      where: { id: session.user.id }, 
    });

    if(!User) return NextResponse.json({ error: "User not found", code: "UNAUTHORIZED" }, { status: 404 });
    if(!slug) return NextResponse.json({ error: "Quiz not found", code: "NOT_FOUND" }, { status: 404 });

    const quiz = await prisma.quiz.findUnique({
      where: { id: slug },
    });
    if(!quiz) return NextResponse.json({ error: "Quiz not found", code: "NOT_FOUND" }, { status: 404 });

    const enrollment = await prisma.quizEnrollments.upsert({
      where: {
        userId_quizId: {
          userId: session.user.id,
          quizId: quiz.id,
        }
      },
      update: {},
      create: {
        userId: session.user.id,
        quizId: quiz.id,
        status: QuizStatus.notStarted,
        score: 0,
      }
    });

    const questions = await prisma.quizQuestion.findMany({
      where: { quizId: quiz.id },
      select: {
        id: true,
        question: true,
        options: {
          select: {
            id: true,
            option: true,
            order: true,
          },
        },
      },
    });
    if(!questions || questions.length === 0) return NextResponse.json({ error: "Quiz not found", code: "NOT_FOUND" }, { status: 404 });
    
    const userAnswers = enrollment?.status === QuizStatus.inProgress
      ? await prisma.userAnswer.findMany({
        where: { enrollmentId: enrollment.id },
        select: {
          questionId: true,
          optionId: true,
        }
      })
      : [];

    const formattedQuestions = questions.map(q => {
      const answered = userAnswers.find(a => a.questionId === q.id) ?? null;

      return {
        id: q.id,
        question: q.question,
        options: q.options,
        selectedOptionId: answered?.optionId ?? null,
      };
    });
    const results = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questions: formattedQuestions,
    };

    return NextResponse.json(results);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    const { slug } = await params;
    if(!session || !session.user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });

    const User = await prisma.user.findUnique({
      where: { id: session.user.id }, 
    });

    if(!User) return NextResponse.json({ error: "User not found", code: "UNAUTHORIZED" }, { status: 404 });
    if(!slug) return NextResponse.json({ error: "Quiz not found", code: "NOT_FOUND" }, { status: 404 });

    const quiz = await prisma.quiz.findUnique({
      where: { id: slug },
    });
    if(!quiz) return NextResponse.json({ error: "Quiz not found", code: "NOT_FOUND" }, { status: 404 });

    const enrollment = await prisma.quizEnrollments.findUnique({
      where: {
        userId_quizId: {
          userId: session.user.id,
          quizId: quiz.id,
        }
      }
    });
    if (!enrollment) return NextResponse.json({ error: "Enrollment not found", code: "NOT_FOUND" }, { status: 404 });

    const userAnswers = enrollment?.status === QuizStatus.inProgress
      ? await prisma.userAnswer.findMany({
          where: { enrollmentId: enrollment.id },
          select: {
            questionId: true,
            optionId: true,
          }
        })
      : [];

    const questions = await prisma.quizQuestion.findMany({
      where: { quizId: quiz.id },
      include: {
        options: {
          select: {
            id: true,
            option: true,
          }
        }
      }
    });

    const results = questions.map(q => {
      const answered = userAnswers.find(a => a.questionId === q.id);

      return {
        id: q.id,
        question: q.question,
        options: q.options,
        selectedOptionId: answered?.optionId ?? null,
      };
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
