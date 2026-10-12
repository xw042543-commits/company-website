package com.yangdoujiao.website.community;

import java.util.function.Supplier;

import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Component
final class CommunityWriteTransaction {
    private final TransactionTemplate transactions;

    CommunityWriteTransaction(PlatformTransactionManager transactionManager) {
        this.transactions = new TransactionTemplate(transactionManager);
    }

    <T> T execute(Supplier<T> action) {
        return transactions.execute(status -> action.get());
    }

    void execute(Runnable action) {
        transactions.executeWithoutResult(status -> action.run());
    }
}
