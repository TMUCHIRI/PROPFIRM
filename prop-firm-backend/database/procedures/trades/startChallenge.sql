CREATE PROCEDURE sp_StartChallenge
    @transactionId UNIQUEIDENTIFIER,
    @userId UNIQUEIDENTIFIER,
    @accountId UNIQUEIDENTIFIER,
    @propAccountId UNIQUEIDENTIFIER,
    @depositAmount DECIMAL(15, 2),
    @tradingBalance DECIMAL(15, 2),
    @currentBalance DECIMAL(15, 2),
    @title VARCHAR(50)
AS
BEGIN
    INSERT INTO PropTransactions (
        transactionId, userId, accountId, propAccountId, depositAmount, tradingBalance, 
        currentBalance, title, status, tradingDays
    )
    VALUES (
        @transactionId, @userId, @accountId, @propAccountId, @depositAmount, @tradingBalance, 
        @currentBalance, @title, 'Phase I', 0
    );
    SELECT * FROM PropTransactions WHERE transactionId = @transactionId;
END