package com.yangdoujiao.website.auth.session;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.yangdoujiao.website.auth.account.AccountIdentifierNormalizer;
import com.yangdoujiao.website.auth.account.AuthValidationException;
import com.yangdoujiao.website.auth.account.UserAccountLookup;
import com.yangdoujiao.website.auth.account.UserAccountStatus;

@Service
public class UserAccountDetailsService implements UserDetailsService {
    private final AccountIdentifierNormalizer normalizer;
    private final UserAccountLookup accounts;

    public UserAccountDetailsService(AccountIdentifierNormalizer normalizer, UserAccountLookup accounts) {
        this.normalizer = normalizer;
        this.accounts = accounts;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try {
            return accounts.findLoginAccount(normalizer.normalizeLogin(username))
                    .filter(account -> account.getStatus() == UserAccountStatus.ACTIVE
                            && account.getDeletedAt() == null)
                    .map(UserPrincipal::from)
                    .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
        } catch (AuthValidationException exception) {
            throw new UsernameNotFoundException("Invalid credentials", exception);
        }
    }
}
