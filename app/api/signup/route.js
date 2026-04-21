import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, guestUserId, name } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
    }
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Get guest user data if guestUserId exists
    let guestData = null;
    if (guestUserId) {
      guestData = await prisma.user.findUnique({
        where: { id: guestUserId },
        include: {
          dailyStats: true,
          attempts: true,
        }
      });
    }
    
    // Create new user with guest data
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: guestData?.name || null,
        phone: guestData?.phone || null,
        xp: guestData?.xp || 0,
        streak: guestData?.streak || 0,
        longestStreak: guestData?.longestStreak || 0,
        lastActiveAt: guestData?.lastActiveAt || null,
        plan: guestData?.plan || 'free',
        planExpiresAt: guestData?.planExpiresAt || null,
        isPremium: guestData?.isPremium || false,
        offeredPrice: guestData?.offeredPrice || null,
        subscriptionExpiresAt: guestData?.subscriptionExpiresAt || null,
        dailyGoal: guestData?.dailyGoal || 15,
      }
    });
    
    // Merge guest data if guestUserId exists
    if (guestUserId) {
      // Update attempts
      await prisma.attempt.updateMany({
        where: { userId: guestUserId },
        data: { userId: newUser.id }
      });
      
      // Update topic progress
      await prisma.topicProgress.updateMany({
        where: { userId: guestUserId },
        data: { userId: newUser.id }
      });
      
      // Update mistakes
      await prisma.mistake.updateMany({
        where: { userId: guestUserId },
        data: { userId: newUser.id }
      });
      
      // Update chapter progress
      await prisma.chapterProgress.updateMany({
        where: { userId: guestUserId },
        data: { userId: newUser.id }
      });
      
      // Update daily stats
      if (guestData?.dailyStats) {
        await prisma.dailyStats.update({
          where: { userId: guestUserId },
          data: { userId: newUser.id }
        });
      }
      
      // Delete guest user
      await prisma.user.delete({
        where: { id: guestUserId }
      });
    }
    
    return NextResponse.json({ userId: newUser.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
