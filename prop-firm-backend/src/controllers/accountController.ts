import { Request, Response, NextFunction } from 'express';
import { AccountService } from '../services/accountService';

const accountService = new AccountService();

export const createAccount = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, type } = req.body;
    try {
        const account = await accountService.createAccount(userId, type);
        res.status(201).json({ message: `${type} account created`, accountId: account.id });
    } catch (error) {
        next(error);
    }
};

export const purchaseAccount = async (req: Request, res: Response, next: NextFunction) => {
    const { accountId, depositAmount, tradingBalance } = req.body;
    try {
        const result = await accountService.purchaseAccount(accountId, depositAmount, tradingBalance);
        res.json({ message: 'Account purchased', result });
    } catch (error) {
        next(error);
    }
};

export const getAccounts = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    try {
        const accounts = await accountService.getUserAccounts(userId);
        res.json({ accounts });
    } catch (error) {
        next(error);
    }
};

export const simulateTrade = async (req: Request, res: Response, next: NextFunction) => {
    const { transactionId, amount, description } = req.body;
    try {
        const result = await accountService.simulateTrade(transactionId, amount, description);
        res.json({ message: 'Trade simulated', result });
    } catch (error) {
        next(error);
    }
};



export const getUserTradeTransactions = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    try {
        const trades = await accountService.getUserTradeTransactions(userId);
        res.json({ trades });
    } catch (error) {
        next(error);
    }
};

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, accountId, propAccountId, depositAmount, tradingBalance, title } = req.body;
    try {
        const transaction = await accountService.createTransaction(userId, accountId, propAccountId, depositAmount, tradingBalance, title);
        res.status(201).json({ message: 'Transaction created', transaction });
    } catch (error) {
        next(error);
    }
};

export const getUserTransactions = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    try {
        const transactions = await accountService.getUserTransactions(userId);
        res.json({ transactions });
    } catch (error) {
        next(error);
    }
};

export const getAllTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const transactions = await accountService.getAllTransactions();
        res.json({ transactions });
    } catch (error) {
        next(error);
    }
};

export const startChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId, accountId, propAccountId } = req.body;
    try {
        const hasActiveChallenge = await accountService.hasActiveChallenge(userId);
        if (hasActiveChallenge) {
            res.status(403).json({ message: 'You already have an active challenge. Complete it before starting a new one.' });
            return;
        }
        
        const transaction = await accountService.startChallenge(userId, accountId, propAccountId);
        res.status(201).json({ message: 'Challenge started', transaction });
    } catch (error) {
        next(error);
    }
};

export const startDemoChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId, accountId, propAccountId } = req.body;
    try {
        const hasActiveDemo = await accountService.hasActiveDemoChallenge(userId);
        if (hasActiveDemo) {
            res.status(403).json({ message: 'You already have an active demo challenge. Complete it first.' });
            return;
        }

        const transaction = await accountService.startDemoChallenge(userId, accountId, propAccountId);
        res.status(201).json({ message: 'Demo challenge started', transaction });
    } catch (error) {
        next(error);
    }
};

export const getUserDemoTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params; // Assume userId comes from URL params
    try {
        const transactions = await accountService.getUserDemoTransactions(userId);
        res.status(200).json({ transactions });
    } catch (error) {
        next(error);
    }
};