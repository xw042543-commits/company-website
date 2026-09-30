package com.yangdoujiao.website.auth.session;

import java.io.Serial;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.yangdoujiao.website.auth.account.UserAccount;

public final class UserPrincipal implements UserDetails, CredentialsContainer, Serializable {
    @Serial private static final long serialVersionUID = 1L;
    private final long userId;
    private final String fullName;
    private final String email;
    private final String phone;
    private String passwordHash;

    private UserPrincipal(long userId, String fullName, String email, String phone, String passwordHash) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.passwordHash = passwordHash;
    }

    public static UserPrincipal from(UserAccount account) {
        return new UserPrincipal(account.getId(), account.getFullName(), account.getNormalizedEmail(),
                account.getNormalizedPhone(), account.getPasswordHash());
    }

    public long userId() { return userId; }
    public String fullName() { return fullName; }
    public String email() { return email; }
    public String phone() { return phone; }

    @Override
    public String getUsername() { return "user:" + userId; }

    @Override
    public String getPassword() { return passwordHash; }

    @Override
    public void eraseCredentials() { passwordHash = null; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }
}
