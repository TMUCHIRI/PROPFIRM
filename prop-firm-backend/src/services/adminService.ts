import poolPromise from '../config/dbConfig';
import sql from 'mssql';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

// NEW: Joi schema for role change
const changeRoleSchema = Joi.object({
    userId: Joi.string().uuid().required(),
    role: Joi.string().valid('user', 'admin').required(),
});

export class AdminService {
    async getAllUsers() {
        const pool = await poolPromise;
        const result = await pool.request().execute('sp_GetAllUsers');
        return result.recordset;
    }

    async getAllAccounts() {
        const pool = await poolPromise;
        const result = await pool.request().execute('sp_GetAllAccounts');
        return result.recordset;
    }

    async getAllTrades() {
        const pool = await poolPromise;
        const result = await pool.request().execute('sp_GetAllTrades');
        return result.recordset;
    }

    async getDashboardStats() {
        const pool = await poolPromise;
        const result = await pool.request().execute('sp_GetDashboardStats');
        return result.recordset[0];
    }

    async getTotalTraders() {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT COUNT(DISTINCT userId) as count FROM Accounts WHERE type = \'live\' AND isActive = 1');
        return result.recordset[0].count;
    }
    
    async getTotalTrades() {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT COUNT(*) as count FROM TradeTransactions');
        return result.recordset[0].count;
    }
    
    async getTotalLiveBalance() {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT SUM(tradingBalance) as total FROM PropTransactions');
        return result.recordset[0].total || 0;
    }

    async toggleAccountStatus(accountId: string, isActive: boolean) {
        const { error } = Joi.object({
            accountId: Joi.string().uuid().required(),
            isActive: Joi.boolean().required(),
        }).validate({ accountId, isActive });
        if (error) throw new Error(error.details[0].message);

        const pool = await poolPromise;
        await pool.request()
            .input('accountId', sql.UniqueIdentifier, accountId)
            .input('isActive', sql.Bit, isActive ? 1 : 0)
            .execute('sp_ToggleAccountStatus');
        return { accountId, isActive };
    }

    async accountStatus(id: string, isActive: boolean){
        const {error} = Joi.object({
            id: Joi.string().uuid().required(),
            isActive: Joi.boolean().required(),
        }).validate({id, isActive});
        if (error) throw new Error(error.details[0].message);

        const pool = await poolPromise;
        await pool.request()
        .input('id', sql.UniqueIdentifier, id)
        .input('isActive', sql.Bit, isActive ? 1 : 0)
        .execute('sp_AccountStatus');
        return { id, isActive};
    }

    // NEW: Change user role
    async changeUserRole(userId: string, role: string) {
        const { error } = changeRoleSchema.validate({ userId, role });
        if (error) throw new Error(error.details[0].message);

        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .input('role', sql.VarChar, role)
            .execute('sp_ChangeUserRole');
        return result.recordset[0];
    }

    async createPropAccount(
        title: string,
        tradingBalance: number,
        challengeFee: number,
        profitTargetPhase1: number = 10.00,
        profitTargetPhase2: number = 7.50,
        dailyLossLimit: number = 5.00,
        maxTrailingDrawdown: number = 10.00,
        minTradingDays: number = 5,
        leverageMax: string = '200:1',
        reEntryAllowed: string = 'Yes at 50% of Fee',
        isDemo: boolean = false
    ) {
        const { error } = Joi.object({
            title: Joi.string().max(50).required(),
            tradingBalance: Joi.number().positive().required(),
            challengeFee: Joi.number().min(0).required(), // Allows 0 for demo
            profitTargetPhase1: Joi.number().positive().max(100).default(10.00),
            profitTargetPhase2: Joi.number().positive().max(100).default(7.50),
            dailyLossLimit: Joi.number().positive().max(100).default(5.00),
            maxTrailingDrawdown: Joi.number().positive().max(100).default(10.00),
            minTradingDays: Joi.number().integer().positive().default(5),
            leverageMax: Joi.string().max(10).default('200:1'),
            reEntryAllowed: Joi.string().max(20).default('Yes at 50% of Fee'),
            isDemo: Joi.boolean().default(false)
        }).validate({
            title, tradingBalance, challengeFee, profitTargetPhase1, profitTargetPhase2,
            dailyLossLimit, maxTrailingDrawdown, minTradingDays, leverageMax, reEntryAllowed, isDemo
        });
        if (error) throw new Error(error.details[0].message);

        // Additional validation: challengeFee must be 0 if isDemo is true
        if (isDemo && challengeFee !== 0) {
            throw new Error('Challenge fee must be 0 for demo accounts');
        }

        const pool = await poolPromise;
        const id = uuidv4();
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('title', sql.VarChar, title)
            .input('tradingBalance', sql.Decimal(15, 2), tradingBalance)
            .input('challengeFee', sql.Decimal(15, 2), challengeFee)
            .input('profitTargetPhase1', sql.Decimal(5, 2), profitTargetPhase1)
            .input('profitTargetPhase2', sql.Decimal(5, 2), profitTargetPhase2)
            .input('dailyLossLimit', sql.Decimal(5, 2), dailyLossLimit)
            .input('maxTrailingDrawdown', sql.Decimal(5, 2), maxTrailingDrawdown)
            .input('minTradingDays', sql.Int, minTradingDays)
            .input('leverageMax', sql.VarChar, leverageMax)
            .input('reEntryAllowed', sql.VarChar, reEntryAllowed)
            .input('isDemo', sql.Bit, isDemo)
            .execute('sp_CreatePropAccount');
        return result.recordset[0];
    }

    async updatePropAccount(
        id: string,
        title: string,
        tradingBalance: number,
        challengeFee: number,
        profitTargetPhase1?: number,
        profitTargetPhase2?: number,
        dailyLossLimit?: number,
        maxTrailingDrawdown?: number,
        minTradingDays?: number,
        leverageMax?: string,
        reEntryAllowed?: string
    ) {
        const { error } = Joi.object({
            id: Joi.string().uuid().required(),
            title: Joi.string().max(50).required(),
            tradingBalance: Joi.number().positive().required(),
            challengeFee: Joi.number().positive().required(),
            profitTargetPhase1: Joi.number().positive().max(100).optional(),
            profitTargetPhase2: Joi.number().positive().max(100).optional(),
            dailyLossLimit: Joi.number().positive().max(100).optional(),
            maxTrailingDrawdown: Joi.number().positive().max(100).optional(),
            minTradingDays: Joi.number().integer().positive().optional(),
            leverageMax: Joi.string().max(10).optional(),
            reEntryAllowed: Joi.string().max(20).optional()
        }).validate({
            id, title, tradingBalance, challengeFee, profitTargetPhase1, profitTargetPhase2,
            dailyLossLimit, maxTrailingDrawdown, minTradingDays, leverageMax, reEntryAllowed
        });
        if (error) throw new Error(error.details[0].message);
    
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('title', sql.VarChar, title)
            .input('tradingBalance', sql.Decimal(15, 2), tradingBalance)
            .input('challengeFee', sql.Decimal(15, 2), challengeFee)
            .input('profitTargetPhase1', sql.Decimal(5, 2), profitTargetPhase1)
            .input('profitTargetPhase2', sql.Decimal(5, 2), profitTargetPhase2)
            .input('dailyLossLimit', sql.Decimal(5, 2), dailyLossLimit)
            .input('maxTrailingDrawdown', sql.Decimal(5, 2), maxTrailingDrawdown)
            .input('minTradingDays', sql.Int, minTradingDays)
            .input('leverageMax', sql.VarChar, leverageMax)
            .input('reEntryAllowed', sql.VarChar, reEntryAllowed)
            .execute('sp_UpdatePropAccount');
        return result.recordset[0];
    }

    async getAllPropAccounts() {
        const pool = await poolPromise;
        const result = await pool.request().execute('sp_GetAllPropAccounts');
        return result.recordset;
    }

    async getAllDemoTransactions() {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT pt.transactionId, pt.userId, pt.accountId, pt.propAccountId, pt.depositAmount, 
                       pt.tradingBalance, pt.currentBalance, pt.title, pt.status, pt.tradingDays, 
                       pt.purchaseDate
                FROM PropTransactions pt
                INNER JOIN Accounts a ON pt.accountId = a.id
                WHERE a.type = 'demo'
            `);
        return result.recordset;
    }
}