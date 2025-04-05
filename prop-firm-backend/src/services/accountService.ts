import poolPromise from '../config/dbConfig';
import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

// NEW: Joi schemas for account operations
const createAccountSchema = Joi.object({
    userId: Joi.string().uuid().required(),
    type: Joi.string().valid('demo', 'live').required(),
    balance: Joi.number().min(0).default(0),
});

const purchaseAccountSchema = Joi.object({
    accountId: Joi.string().uuid().required(),
    depositAmount: Joi.number().positive().required(),
    tradingBalance: Joi.number().positive().required(),
});

const tradeSchema = Joi.object({
    accountId: Joi.string().uuid().required(),
    amount: Joi.number().negative().required(),
    description: Joi.string().required(),
});

const transactionSchema = Joi.object({
    userId: Joi.string().uuid().required(),
    accountId: Joi.string().uuid().required(),
    propAccountId: Joi.string().uuid().required(),
    depositAmount: Joi.number().positive().required(),
    tradingBalance: Joi.number().positive().required(),
    title: Joi.string().required()
});

export class AccountService {
    async createAccount(userId: string, type: string, balance: number = 0) {
        const { error } = createAccountSchema.validate({ userId, type, balance });
        if (error) throw new Error(error.details[0].message);

        const accountId = uuidv4();
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, accountId)
            .input('userId', sql.UniqueIdentifier, userId)
            .input('type', sql.VarChar, type)
            .input('balance', sql.Decimal(15, 2), balance)
            .execute('sp_CreateAccount');
        return { id: result.recordset[0].id, type };
    }

    async purchaseAccount(accountId: string, depositAmount: number, tradingBalance: number) {
        const { error } = purchaseAccountSchema.validate({ accountId, depositAmount, tradingBalance });
        if (error) throw new Error(error.details[0].message);

        const purchaseId = uuidv4();
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.UniqueIdentifier, purchaseId)
            .input('accountId', sql.UniqueIdentifier, accountId)
            .input('depositAmount', sql.Decimal(15, 2), depositAmount)
            .input('tradingBalance', sql.Decimal(15, 2), tradingBalance)
            .execute('sp_PurchaseAccount');
        return { accountId, depositAmount, tradingBalance };
    }

    async getUserAccounts(userId: string) {
        const { error } = Joi.string().uuid().required().validate(userId);
        if (error) throw new Error('Invalid user ID');

        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .execute('sp_GetUserAccounts');
        return result.recordset;
    }

    async getUserTradeTransactions(userId: string) {
        const { error } = Joi.string().uuid().required().validate(userId);
        if (error) throw new Error('Invalid user ID');

        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(`
                SELECT tt.tradeId, tt.amount, tt.description, tt.tradeDate, pt.accountId
                FROM TradeTransactions tt
                INNER JOIN PropTransactions pt ON tt.transactionId = pt.transactionId
                WHERE pt.userId = @userId
            `);
        return result.recordset;
    }


    async createTransaction(userId: string, accountId: string, propAccountId: string, depositAmount: number, tradingBalance: number, title: string) {
        const { error } = transactionSchema.validate({ userId, accountId, propAccountId, depositAmount, tradingBalance, title });
        if (error) throw new Error(error.details[0].message);

        const transactionId = uuidv4();
        const pool = await poolPromise;
        const result = await pool.request()
            .input('transactionId', sql.UniqueIdentifier, transactionId)
            .input('userId', sql.UniqueIdentifier, userId)
            .input('accountId', sql.UniqueIdentifier, accountId)
            .input('propAccountId', sql.UniqueIdentifier, propAccountId)
            .input('depositAmount', sql.Decimal(15, 2), depositAmount)
            .input('tradingBalance', sql.Decimal(15, 2), tradingBalance)
            .input('title', sql.VarChar, title)
            .execute('sp_CreateTransaction');
        return result.recordset[0];
    }

    async getUserTransactions(userId: string) {
        const { error } = Joi.string().uuid().required().validate(userId);
        if (error) throw new Error('Invalid user ID');

        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .execute('sp_GetUserTransactions');
        return result.recordset;
    }

    async getAllTransactions() {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT transactionId, userId, accountId, propAccountId, depositAmount, tradingBalance, currentBalance, title, purchaseDate FROM PropTransactions');
        return result.recordset;
    }

    async hasActiveChallenge(userId: string): Promise<boolean> {
        const { error } = Joi.string().uuid().required().validate(userId);
        if (error) throw new Error('Invalid user ID');

        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(`
                SELECT COUNT(*) as activeCount
                FROM PropTransactions
                WHERE userId = @userId
                AND status IN ('Phase I', 'Phase II')
            `);
        
        return result.recordset[0].activeCount > 0;
    }

    //challenge with more rules
    async startChallenge(userId: string, accountId: string, propAccountId: string) {
        const { error } = Joi.object({
            userId: Joi.string().uuid().required(),
            accountId: Joi.string().uuid().required(),
            propAccountId: Joi.string().uuid().required()
        }).validate({ userId, accountId, propAccountId });
        if (error) throw new Error(error.details[0].message);
    
        const pool = await poolPromise;
    
        // Fetch PropAccount details
        const propAccountResult = await pool.request()
            .input('id', sql.UniqueIdentifier, propAccountId)
            .query('SELECT * FROM PropAccounts WHERE id = @id');
        const propAccount = propAccountResult.recordset[0];
        if (!propAccount) throw new Error('Prop account not found');
    
        const transactionId = uuidv4();
        const result = await pool.request()
            .input('transactionId', sql.UniqueIdentifier, transactionId)
            .input('userId', sql.UniqueIdentifier, userId)
            .input('accountId', sql.UniqueIdentifier, accountId)
            .input('propAccountId', sql.UniqueIdentifier, propAccountId)
            .input('depositAmount', sql.Decimal(15, 2), propAccount.challengeFee)
            .input('tradingBalance', sql.Decimal(15, 2), propAccount.tradingBalance)
            .input('currentBalance', sql.Decimal(15, 2), propAccount.tradingBalance) // Start with initial balance
            .input('title', sql.VarChar, propAccount.title)
            .execute('sp_StartChallenge');
        return result.recordset[0];
    }

    async simulateTrade(transactionId: string, amount: number, description: string) {
        const { error } = Joi.object({
            transactionId: Joi.string().uuid().required(),
            amount: Joi.number().required(), // Can be positive or negative
            description: Joi.string().max(255).required()
        }).validate({ transactionId, amount, description });
        if (error) throw new Error(error.details[0].message);
    
        const pool = await poolPromise;
    
        // Fetch transaction and prop account details
        const transactionResult = await pool.request()
            .input('transactionId', sql.UniqueIdentifier, transactionId)
            .query('SELECT * FROM PropTransactions WHERE transactionId = @transactionId');
        const transaction = transactionResult.recordset[0];
        if (!transaction) throw new Error('Transaction not found');
    
        const propAccountResult = await pool.request()
            .input('id', sql.UniqueIdentifier, transaction.propAccountId)
            .query('SELECT * FROM PropAccounts WHERE id = @id');
        const propAccount = propAccountResult.recordset[0];
    
        // Update balance and trading days
        const newBalance = transaction.currentBalance + amount;
        const newTradingDays = transaction.tradingDays + 1;
    
        // Rule checks
        const dailyLoss = transaction.currentBalance - newBalance;
        if (dailyLoss > (propAccount.dailyLossLimit / 100) * propAccount.tradingBalance) {
            await pool.request()
                .input('transactionId', sql.UniqueIdentifier, transactionId)
                .input('status', sql.VarChar, 'Failed')
                .query('UPDATE PropTransactions SET status = @status WHERE transactionId = @transactionId');
            throw new Error('Daily loss limit exceeded. Challenge failed.');
        }
    
        const drawdown = propAccount.tradingBalance - newBalance;
        if (drawdown > (propAccount.maxTrailingDrawdown / 100) * propAccount.tradingBalance) {
            await pool.request()
                .input('transactionId', sql.UniqueIdentifier, transactionId)
                .input('status', sql.VarChar, 'Failed')
                .query('UPDATE PropTransactions SET status = @status WHERE transactionId = @transactionId');
            throw new Error('Max trailing drawdown exceeded. Challenge failed.');
        }
    
        // Check phase progression
        let newStatus = transaction.status;
        const profit = newBalance - propAccount.tradingBalance;
        if (transaction.status === 'Phase I' && profit >= (propAccount.profitTargetPhase1 / 100) * propAccount.tradingBalance) {
            newStatus = 'Phase II';
        } else if (transaction.status === 'Phase II' && profit >= (propAccount.profitTargetPhase2 / 100) * propAccount.tradingBalance) {
            newStatus = 'Completed';
        }
    
        // Update transaction
        await pool.request()
            .input('transactionId', sql.UniqueIdentifier, transactionId)
            .input('currentBalance', sql.Decimal(15, 2), newBalance)
            .input('tradingDays', sql.Int, newTradingDays)
            .input('status', sql.VarChar, newStatus)
            .query(`
                UPDATE PropTransactions 
                SET currentBalance = @currentBalance, tradingDays = @tradingDays, status = @status
                WHERE transactionId = @transactionId
            `);
    
        // Insert trade record (assuming a TradeTransactions table exists)
        const tradeId = uuidv4();
        await pool.request()
            .input('tradeId', sql.UniqueIdentifier, tradeId)
            .input('transactionId', sql.UniqueIdentifier, transactionId)
            .input('amount', sql.Decimal(15, 2), amount)
            .input('description', sql.VarChar, description)
            .query(`
                INSERT INTO TradeTransactions (tradeId, transactionId, amount, description, tradeDate)
                VALUES (@tradeId, @transactionId, @amount, @description, GETDATE())
            `);
    
        return { tradeId, transactionId, amount, description, newBalance, newStatus };
    }

    async hasActiveDemoChallenge(userId: string): Promise<boolean> {
        const { error } = Joi.string().uuid().required().validate(userId);
        if (error) throw new Error('Invalid user ID');

        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(`
                SELECT COUNT(*) as activeCount
                FROM PropTransactions pt
                INNER JOIN Accounts a ON pt.accountId = a.id
                WHERE pt.userId = @userId
                AND a.type = 'demo'
                AND pt.status IN ('Phase I', 'Phase II')
            `);
        return result.recordset[0].activeCount > 0;
    }

    async startDemoChallenge(userId: string, accountId: string, propAccountId: string) {
        const { error } = Joi.object({
            userId: Joi.string().uuid().required(),
            accountId: Joi.string().uuid().required(),
            propAccountId: Joi.string().uuid().required()
        }).validate({ userId, accountId, propAccountId });
        if (error) throw new Error('Invalid input');

        const pool = await poolPromise;

        // Verify account is demo
        const accountCheck = await pool.request()
            .input('accountId', sql.UniqueIdentifier, accountId)
            .query('SELECT type FROM Accounts WHERE id = @accountId');
        if (accountCheck.recordset[0]?.type !== 'demo') throw new Error('Invalid demo account');

        // Fetch prop account details (must be a demo challenge)
        const propAccountResult = await pool.request()
            .input('propAccountId', sql.UniqueIdentifier, propAccountId)
            .query('SELECT tradingBalance, title, isDemo FROM PropAccounts WHERE id = @propAccountId');
        if (!propAccountResult.recordset.length || !propAccountResult.recordset[0].isDemo) {
            throw new Error('Invalid or non-demo prop account');
        }
        const { tradingBalance, title } = propAccountResult.recordset[0];

        // Insert demo transaction (no depositAmount for demo)
        const transactionResult = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .input('accountId', sql.UniqueIdentifier, accountId)
            .input('propAccountId', sql.UniqueIdentifier, propAccountId)
            .input('tradingBalance', sql.Decimal(15, 2), tradingBalance)
            .input('currentBalance', sql.Decimal(15, 2), tradingBalance)
            .input('title', sql.VarChar(50), title)
            .query(`
                INSERT INTO PropTransactions (userId, accountId, propAccountId, depositAmount, tradingBalance, currentBalance, title, status, purchaseDate)
                OUTPUT INSERTED.transactionId, INSERTED.userId, INSERTED.accountId, INSERTED.propAccountId, 
                       INSERTED.depositAmount, INSERTED.tradingBalance, INSERTED.currentBalance, INSERTED.title, 
                       INSERTED.status, INSERTED.purchaseDate
                VALUES (@userId, @accountId, @propAccountId, 0.00, @tradingBalance, @currentBalance, @title, 'Phase I', GETDATE())
            `);
        return transactionResult.recordset[0];
    }

    async getUserDemoTransactions(userId: string) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(`
                SELECT pt.transactionId, pt.userId, pt.accountId, pt.propAccountId, pt.depositAmount, 
                       pt.tradingBalance, pt.currentBalance, pt.title, pt.status, pt.tradingDays, 
                       pt.purchaseDate
                FROM PropTransactions pt
                INNER JOIN Accounts a ON pt.accountId = a.id
                WHERE pt.userId = @userId AND a.type = 'demo'
            `);
        return result.recordset;
            }    
}
