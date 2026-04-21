import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    // Get user's offered_price from DB (never trust frontend price)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { offeredPrice: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    let price = user.offeredPrice;
    
    // If offered_price not set, call pricing logic to set it first
    if (!price) {
      const pricingStats = await prisma.pricingStats.findUnique({
        where: { id: 1 }
      });
      
      const totalPaidUsers = pricingStats?.totalPaidUsers || 0;
      price = totalPaidUsers < 50 ? 99 : 299;
      
      await prisma.user.update({
        where: { id: userId },
        data: { offeredPrice: price }
      });
    }
    
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: price * 100, // paise
      currency: 'INR',
      receipt: `receipt_${userId}_${Date.now()}`
    });
    
    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
