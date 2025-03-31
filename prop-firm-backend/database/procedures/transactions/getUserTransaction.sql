CREATE PROCEDURE sp_GetUserTransactions
    @userId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT transactionId, userId, accountId, propAccountId, depositAmount, tradingBalance, currentBalance, status, title, purchaseDate
    FROM PropTransactions
    WHERE userId = @userId;
END;