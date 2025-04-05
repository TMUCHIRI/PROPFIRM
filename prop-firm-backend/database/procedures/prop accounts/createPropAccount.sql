CREATE PROCEDURE sp_CreatePropAccount
    @id UNIQUEIDENTIFIER,
    @title VARCHAR(50),
    @tradingBalance DECIMAL(15, 2),
    @challengeFee DECIMAL(15, 2),
    @profitTargetPhase1 DECIMAL(5, 2),
    @profitTargetPhase2 DECIMAL(5, 2),
    @dailyLossLimit DECIMAL(5, 2),
    @maxTrailingDrawdown DECIMAL(5, 2),
    @minTradingDays INT,
    @leverageMax VARCHAR(10),
    @reEntryAllowed VARCHAR(20),
    @isDemo BIT = 0 -- Added isDemo parameter
AS
BEGIN
    INSERT INTO PropAccounts (
        id, title, tradingBalance, challengeFee, profitTargetPhase1, profitTargetPhase2,
        dailyLossLimit, maxTrailingDrawdown, minTradingDays, leverageMax, reEntryAllowed, isDemo
    )
    VALUES (
        @id, @title, @tradingBalance, @challengeFee, @profitTargetPhase1, @profitTargetPhase2,
        @dailyLossLimit, @maxTrailingDrawdown, @minTradingDays, @leverageMax, @reEntryAllowed, @isDemo
    );
    SELECT * FROM PropAccounts WHERE id = @id; -- Return the created record
END;