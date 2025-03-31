CREATE PROCEDURE sp_UpdatePropAccount
    @id UNIQUEIDENTIFIER,
    @title VARCHAR(50),
    @tradingBalance DECIMAL(15, 2),
    @challengeFee DECIMAL(15, 2),
    @profitTargetPhase1 DECIMAL(5, 2) = NULL,
    @profitTargetPhase2 DECIMAL(5, 2) = NULL,
    @dailyLossLimit DECIMAL(5, 2) = NULL,
    @maxTrailingDrawdown DECIMAL(5, 2) = NULL,
    @minTradingDays INT = NULL,
    @leverageMax VARCHAR(10) = NULL,
    @reEntryAllowed VARCHAR(20) = NULL
AS
BEGIN
    UPDATE PropAccounts
    SET 
        title = @title,
        tradingBalance = @tradingBalance,
        challengeFee = @challengeFee,
        profitTargetPhase1 = COALESCE(@profitTargetPhase1, profitTargetPhase1),
        profitTargetPhase2 = COALESCE(@profitTargetPhase2, profitTargetPhase2),
        dailyLossLimit = COALESCE(@dailyLossLimit, dailyLossLimit),
        maxTrailingDrawdown = COALESCE(@maxTrailingDrawdown, maxTrailingDrawdown),
        minTradingDays = COALESCE(@minTradingDays, minTradingDays),
        leverageMax = COALESCE(@leverageMax, leverageMax),
        reEntryAllowed = COALESCE(@reEntryAllowed, reEntryAllowed),
        updatedAt = GETDATE()
    WHERE id = @id;
    SELECT * FROM PropAccounts WHERE id = @id;
END