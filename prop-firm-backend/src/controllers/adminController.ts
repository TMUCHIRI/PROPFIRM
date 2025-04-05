import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/adminService';

const adminService = new AdminService();

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await adminService.getAllUsers();
        res.json({ users });
    } catch (error) {
        next(error);
    }
};

export const getAllAccounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accounts = await adminService.getAllAccounts();
        res.json({ accounts });
    } catch (error) {
        next(error);
    }
};

export const getAllTrades = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trades = await adminService.getAllTrades();
        res.json({ trades });
    } catch (error) {
        next(error);
    }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const totalTraders = await adminService.getTotalTraders(); // Live account users
        const activeTrades = await adminService.getTotalTrades();
        const totalLiveBalance = await adminService.getTotalLiveBalance();
        res.json({ totalTraders, activeTrades, totalLiveBalance });
    } catch (error) {
        next(error);
    }
};

export const toggleAccountStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { accountId, isActive } = req.body;
    try {
        const result = await adminService.toggleAccountStatus(accountId, isActive);
        res.json({ message: `Account ${isActive ? 'activated' : 'deactivated'}`, result });
    } catch (error) {
        next(error);
    }
};

export const accountStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { id, isActive } = req.body;
    try {
        const result = await adminService.accountStatus(id, isActive);
        res.json({message: `Account ${isActive ? 'activated' : 'deactivated'}`, result })
    } catch (error) {
        next(error)
    }
}

// NEW: Change user role endpoint
export const changeUserRole = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, role } = req.body;
    try {
        const user = await adminService.changeUserRole(userId, role);
        res.json({ message: `User role changed to ${role}`, user });
    } catch (error) {
        next(error);
    }
};

export const createPropAccount = async (req: Request, res: Response, next: NextFunction) => {
    const { title, tradingBalance, challengeFee, profitTargetPhase1, profitTargetPhase2, dailyLossLimit, maxTrailingDrawdown, minTradingDays, leverageMax, reEntryAllowed, isDemo } = req.body;
    try {
        const propAccount = await adminService.createPropAccount(title, tradingBalance, challengeFee, profitTargetPhase1, profitTargetPhase2, dailyLossLimit, maxTrailingDrawdown, minTradingDays, leverageMax, reEntryAllowed, isDemo);
        res.status(201).json({ message: 'Prop account created', propAccount });
    } catch (error) {
        next(error);
    }
};

export const updatePropAccount = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, tradingBalance, challengeFee, profitTargetPhase1, profitTargetPhase2, dailyLossLimit, maxTrailingDrawdown, minTradingDays, leverageMax, reEntryAllowed } = req.body;
    try {
        const propAccount = await adminService.updatePropAccount(id, title, tradingBalance, challengeFee, profitTargetPhase1, profitTargetPhase2, dailyLossLimit, maxTrailingDrawdown, minTradingDays, leverageMax, reEntryAllowed);
        res.json({ message: 'Prop account updated', propAccount });
    } catch (error) {
        next(error);
    }
};

export const getAllPropAccounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const propAccounts = await adminService.getAllPropAccounts();
        res.json({ propAccounts });
    } catch (error) {
        next(error);
    }
};

export const getAllDemoTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const transactions = await adminService.getAllDemoTransactions();
        res.status(200).json({ transactions });
    } catch (error) {
        next(error);
    }
};