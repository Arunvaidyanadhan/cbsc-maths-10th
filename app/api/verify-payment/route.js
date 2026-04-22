import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import crypto from 'crypto';
import { getRequestUserId } from '../../../lib/auth.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    const userId = await getRequestUserId(request, { allowQuery: true });
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify signature
    const bodyString = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(bodyString)
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    // Check if user is already premium (idempotent)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true }
    });
    
    if (user.isPremium) {
      return NextResponse.json({ success: true });
    }
    
    // Update user to premium and increment paid users counter in a single transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        }
      }),
      prisma.pricingStats.update({
        where: { id: 1 },
        data: {
          totalPaidUsers: { increment: 1 }
        }
      })
    ]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
