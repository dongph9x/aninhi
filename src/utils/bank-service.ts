import prisma from './prisma';
import { fishCoinDB } from './fish-coin';

export interface ExchangeRate {
  aniToFish: {
    minAmount: number;
    fishReceived: number;
    rate: number; // Tỷ lệ: 1 AniCoin = ? FishCoin
  };
  fishToAni: {
    minAmount: number;
    aniReceived: number;
    rate: number; // Tỷ lệ: 1 FishCoin = ? AniCoin
  };
}

export interface ExchangeResult {
  success: boolean;
  error?: string;
  fromCurrency: 'AniCoin' | 'FishCoin';
  toCurrency: 'AniCoin' | 'FishCoin';
  amount: number;
  received: number;
  fee?: number;
  exchangeRate?: number;
}

export class BankService {
  // Tỷ lệ chuyển đổi cố định
  private static readonly EXCHANGE_RATES: ExchangeRate = {
    aniToFish: {
      minAmount: 1000,
      fishReceived: 500,
      rate: 0.5 // 1 AniCoin = 0.5 FishCoin
    },
    fishToAni: {
      minAmount: 1000,
      aniReceived: 1500,
      rate: 1.5 // 1 FishCoin = 1.5 AniCoin
    }
  };

  /**
   * Chuyển AniCoin sang FishCoin
   */
  static async exchangeAniToFish(userId: string, guildId: string, amount: number): Promise<ExchangeResult> {
    try {
      // Kiểm tra số tiền tối thiểu
      if (amount < this.EXCHANGE_RATES.aniToFish.minAmount) {
        return {
          success: false,
          error: `Số tiền tối thiểu để chuyển đổi là ${this.EXCHANGE_RATES.aniToFish.minAmount.toLocaleString()} AniCoin`,
          fromCurrency: 'AniCoin',
          toCurrency: 'FishCoin',
          amount,
          received: 0
        };
      }

      // Kiểm tra số dư AniCoin
      const user = await prisma.user.findUnique({
        where: { userId_guildId: { userId, guildId } }
      });

      if (!user) {
        return {
          success: false,
          error: 'Không tìm thấy người dùng',
          fromCurrency: 'AniCoin',
          toCurrency: 'FishCoin',
          amount,
          received: 0
        };
      }

      if (Number(user.balance) < amount) {
        return {
          success: false,
          error: `Không đủ AniCoin! Số dư hiện tại: ${Number(user.balance).toLocaleString()} AniCoin`,
          fromCurrency: 'AniCoin',
          toCurrency: 'FishCoin',
          amount,
          received: 0
        };
      }

      // Tính số FishCoin nhận được
      const fishReceived = Math.floor(amount * this.EXCHANGE_RATES.aniToFish.rate);

      // Thực hiện giao dịch
      await prisma.user.update({
        where: { userId_guildId: { userId, guildId } },
        data: { balance: { decrement: BigInt(amount) } }
      });

      // Cộng FishCoin
      await fishCoinDB.addFishCoin(userId, guildId, fishReceived, `Bank exchange: ${amount.toLocaleString()} AniCoin → ${fishReceived} FishCoin`);

      return {
        success: true,
        fromCurrency: 'AniCoin',
        toCurrency: 'FishCoin',
        amount,
        received: fishReceived,
        exchangeRate: this.EXCHANGE_RATES.aniToFish.rate
      };

    } catch (error) {
      console.error('Error in exchangeAniToFish:', error);
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi chuyển đổi tiền tệ',
        fromCurrency: 'AniCoin',
        toCurrency: 'FishCoin',
        amount,
        received: 0
      };
    }
  }

  /**
   * Chuyển FishCoin sang AniCoin
   */
  static async exchangeFishToAni(userId: string, guildId: string, amount: number): Promise<ExchangeResult> {
    try {
      // Kiểm tra số tiền tối thiểu
      if (amount < this.EXCHANGE_RATES.fishToAni.minAmount) {
        return {
          success: false,
          error: `Số tiền tối thiểu để chuyển đổi là ${this.EXCHANGE_RATES.fishToAni.minAmount.toLocaleString()} FishCoin`,
          fromCurrency: 'FishCoin',
          toCurrency: 'AniCoin',
          amount,
          received: 0
        };
      }

      // Kiểm tra số dư FishCoin
      const hasEnoughFishCoin = await fishCoinDB.hasEnoughFishCoin(userId, guildId, amount);
      if (!hasEnoughFishCoin) {
        const currentBalance = await fishCoinDB.getFishBalance(userId, guildId);
        return {
          success: false,
          error: `Không đủ FishCoin! Số dư hiện tại: ${currentBalance.toString()} FishCoin`,
          fromCurrency: 'FishCoin',
          toCurrency: 'AniCoin',
          amount,
          received: 0
        };
      }

      // Tính số AniCoin nhận được
      const aniReceived = Math.floor(amount * this.EXCHANGE_RATES.fishToAni.rate);

      // Thực hiện giao dịch
      // Trừ FishCoin
      await fishCoinDB.subtractFishCoin(userId, guildId, amount, `Bank exchange: ${amount} FishCoin → ${aniReceived.toLocaleString()} AniCoin`);

      // Cộng AniCoin
      await prisma.user.update({
        where: { userId_guildId: { userId, guildId } },
        data: { balance: { increment: BigInt(aniReceived) } }
      });

      return {
        success: true,
        fromCurrency: 'FishCoin',
        toCurrency: 'AniCoin',
        amount,
        received: aniReceived,
        exchangeRate: this.EXCHANGE_RATES.fishToAni.rate
      };

    } catch (error) {
      console.error('Error in exchangeFishToAni:', error);
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi chuyển đổi tiền tệ',
        fromCurrency: 'FishCoin',
        toCurrency: 'AniCoin',
        amount,
        received: 0
      };
    }
  }

  /**
   * Lấy thông tin tỷ lệ chuyển đổi
   */
  static getExchangeRates(): ExchangeRate {
    return this.EXCHANGE_RATES;
  }

  /**
   * Tính toán số tiền nhận được (không thực hiện giao dịch)
   */
  static calculateExchange(fromCurrency: 'AniCoin' | 'FishCoin', amount: number): { received: number; rate: number; isValid: boolean } {
    if (fromCurrency === 'AniCoin') {
      const isValid = amount >= this.EXCHANGE_RATES.aniToFish.minAmount;
      const received = isValid ? Math.floor(amount * this.EXCHANGE_RATES.aniToFish.rate) : 0;
      return {
        received,
        rate: this.EXCHANGE_RATES.aniToFish.rate,
        isValid
      };
    } else {
      const isValid = amount >= this.EXCHANGE_RATES.fishToAni.minAmount;
      const received = isValid ? Math.floor(amount * this.EXCHANGE_RATES.fishToAni.rate) : 0;
      return {
        received,
        rate: this.EXCHANGE_RATES.fishToAni.rate,
        isValid
      };
    }
  }

  /**
   * Lấy lịch sử giao dịch bank
   */
  static async getBankHistory(userId: string, guildId: string, limit: number = 10) {
    try {
      // Lấy giao dịch AniCoin (từ Transaction table)
      const aniTransactions = await prisma.transaction.findMany({
        where: {
          userId,
          guildId,
          description: {
            contains: 'Bank exchange'
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      // Lấy giao dịch FishCoin (từ FishTransaction table)
      const fishTransactions = await prisma.fishTransaction.findMany({
        where: {
          userId,
          guildId,
          description: {
            contains: 'Bank exchange'
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      // Kết hợp và sắp xếp theo thời gian
      const allTransactions = [
        ...aniTransactions.map(tx => ({
          ...tx,
          currency: 'AniCoin' as const,
          createdAt: tx.createdAt
        })),
        ...fishTransactions.map(tx => ({
          ...tx,
          currency: 'FishCoin' as const,
          createdAt: tx.createdAt
        }))
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return allTransactions.slice(0, limit);
    } catch (error) {
      console.error('Error getting bank history:', error);
      return [];
    }
  }
} 