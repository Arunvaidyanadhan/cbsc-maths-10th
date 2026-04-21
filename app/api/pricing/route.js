import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    // Get user to check if offered_price exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { offeredPrice: true }
    });
    
    // If user already has offered_price, return it directly
    if (user.offeredPrice) {
      return NextResponse.json({
        price: user.offeredPrice,
        tier: user.offeredPrice === 99 ? 'early_bird' : 'standard',
        remaining_slots: null
      });
    }
    
    // Get total paid users from pricing_stats
    const pricingStats = await prisma.pricingStats.findUnique({
      where: { id: 1 }
    });
    
    const totalPaidUsers = pricingStats?.totalPaidUsers || 0;
    
    // Determine pricing tier
    let price, tier, remainingSlots;
    
    if (totalPaidUsers < 50) {
      price = 99;
      tier = 'early_bird';
      remainingSlots = 50 - totalPaidUsers;
    } else {
      price = 299;
      tier = 'standard';
      remainingSlots = null;
    }
    
    // Save offered_price on user row
    await prisma.user.update({
      where: { id: userId },
      data: { offeredPrice: price }
    });
    
    return NextResponse.json({
      price,
      tier,
      remaining_slots: remainingSlots
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
